import React from 'react';
import { useState, useRef } from 'react';
import html2pdf from "html2pdf.js";
import { AppBar, Toolbar, Avatar, Tooltip } from "@mui/material";
import {
    Paper,
    Box,
    Typography,
    TextField,
    Divider,
    IconButton,
    Button,
} from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align'
import { EditorContent } from '@tiptap/react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useSnackbar } from 'notistack';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';
import { jwtDecode } from "jwt-decode";

const MAX_CHAR = 5000;

const MediaForm = ({ editor, clearContent }) => {
    const [errors, setErrors] = useState({});
    const chiefEditor = useEditor({
        extensions: [StarterKit,
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content: '',
    });


    const consultEditor = useEditor({
        extensions: [StarterKit,
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content: '',
    });
    const [formData, setFormData] = useState({
        clinicName: '',
        physicianName: '',
        patientFirstName: '',
        patientDob: '',
        clinicLogo: '',
        physicianContact: '',
        patientLastName: '',
        patientContact: ''
    });
    const initialFormData = {
        clinicName: '',
        physicianName: '',
        patientFirstName: '',
        patientDob: '',
        clinicLogo: '',
        physicianContact: '',
        patientLastName: '',
        patientContact: ''
    };


    const printableRef = useRef();
    const { enqueueSnackbar } = useSnackbar();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };
    const getEmailFromToken = () => {
        const token = localStorage.getItem("token");
        if (!token) return null;

        try {
            const decoded = jwtDecode(token);
            return decoded.sub || null;
        } catch (error) {
            console.error("Invalid token", error);
            return null;
        }
    };

    const username = getEmailFromToken()

    const validate = () => {
        const newErrors = {};
        const phoneRegex = /^[0-9]{10,15}$/;
        const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
        const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

        // Required fields validation
        const requiredFields = [
            'clinicName',
            'physicianName',
            'patientFirstName',
            'patientLastName',
            'patientDob'
        ];

        requiredFields.forEach(field => {
            if (!formData[field]?.trim()) {
                newErrors[field] = 'This field is required';
            }
        });
        if (formData.clinicName && formData.clinicName.length > 50) {
            newErrors.clinicName = 'Clinic name should be less than 50 characters';
        }

        if (formData.physicianName && formData.physicianName.length > 50) {
            newErrors.physicianName = 'Physician name should be less than 50 characters';
        }

        if (formData.patientFirstName && formData.patientFirstName.length > 50) {
            newErrors.patientFirstName = 'First name should be less than 50 characters';
        }

        if (formData.patientLastName && formData.patientLastName.length > 50) {
            newErrors.patientLastName = 'Last name should be less than 50 characters';
        }

        if (formData.patientDob) {
            if (!dateRegex.test(formData.patientDob)) {
                newErrors.patientDob = 'Invalid date format (DD-MM-YYYY)';
            } else {
                const dob = new Date(formData.patientDob);
                const today = new Date();
                if (dob > today) {
                    newErrors.patientDob = 'Date of birth cannot be in the future';
                }
            }
        }

        if (formData.physicianContact && !phoneRegex.test(formData.physicianContact)) {
            newErrors.physicianContact = 'Invalid phone number (10-15 digits)';
        }

        if (formData.patientContact && !phoneRegex.test(formData.patientContact)) {
            newErrors.patientContact = 'Invalid phone number (10-15 digits)';
        }

        if (formData.clinicLogo && !urlRegex.test(formData.clinicLogo)) {
            newErrors.clinicLogo = 'Invalid URL format';
        }

        // Editor  validation
        if (chiefEditor?.getText().trim().length === 0) {
            newErrors.chiefComplaint = 'Chief complaint is required';
        } else if (chiefEditor?.getText().length > MAX_CHAR) {
            newErrors.chiefComplaint = `Chief complaint exceeds ${MAX_CHAR} characters`;
        }
        //consult editor
        if (consultEditor?.getText().trim().length === 0) {
            newErrors.consultationNote = 'Consultation note is required';
        } else if (consultEditor?.getText().length > MAX_CHAR) {
            newErrors.consultationNote = `Consultation note exceeds ${MAX_CHAR} characters`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const generatePDF = () => {
        if (!validate()) {
            return; //  if validation fails (false)
        }
        const element = printableRef.current.cloneNode(true);
        const images = element.getElementsByTagName('img');
        while (images.length > 0) {
            images[0].parentNode.removeChild(images[0]);
        }

        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.appendChild(element);
        document.body.appendChild(container);

        const opt = {
            margin: [60, 20],
            filename: `CR_${formData.patientLastName}_${formData.patientFirstName}_${formData.patientDob.replace(/\//g, '-')}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: true,
                letterRendering: true
            },
            jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
            pagebreak: { mode: ["css", "legacy"] },
            enableLinks: true,
        };

        html2pdf()
            .set(opt)
            .from(element)
            .toPdf()
            .get("pdf")
            .then((pdf) => {
                const pageCount = pdf.internal.getNumberOfPages();
                const currentTime = new Date().toLocaleString();

                for (let i = 1; i <= pageCount; i++) {
                    pdf.setPage(i);
                    if (formData.clinicLogo) {
                        try {
                            pdf.addImage(formData.clinicLogo, "JPEG", 40, 20, 80, 40);
                        } catch (error) {
                            console.error("Error adding image:", error);
                        }
                    }
                    pdf.setFontSize(10);
                    // pdf.text(formData.clinicName || 'Clinic Report', 130, 40);
                    pdf.setFontSize(9);
                    pdf.text(
                        `This report is generated on ${currentTime} - Page ${i} of ${pageCount}`,
                        pdf.internal.pageSize.getWidth() / 2,
                        pdf.internal.pageSize.getHeight() - 30,
                        { align: "center" }
                    );
                }
            })
            .save()
            .then(() => {
                // Reset formData and editors snackbar for toast
                enqueueSnackbar("Form data added successfully!", {
                    variant: "success",
                    autoHideDuration: 1000, // 3 seconds
                });
                setFormData(initialFormData);
                chiefEditor?.commands.clearContent();
                consultEditor?.commands.clearContent();
                setErrors({});
            })
            .finally(() => {
                document.body.removeChild(container);
            });
    };
    return (

        <div>
            <AppBar position="static" color="primary" elevation={2}>
                <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="h6">My App</Typography>

                    <Box display="flex" alignItems="center">
                        <Tooltip title={getEmailFromToken() || "User"} arrow>
                            <Avatar sx={{ bgcolor: "#1976d2", cursor: "pointer" }}>
                                {username ? username.charAt(0).toUpperCase() : "U"}
                            </Avatar>
                        </Tooltip>
                    </Box>
                </Toolbar>
            </AppBar>
            <Paper
                elevation={0}
                sx={{
                    margin: '0 auto',
                    border: '.5px solid #e0e0e0',
                    padding: '55px',
                }}
            >
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '40px', mb: 3 }}>
                    <Box sx={{ flex: 1, minWidth: '300px' }}>
                        {[
                            { name: 'clinicName', label: 'Clinic Name', placeholder: 'Enter clinic name' },
                            { name: 'physicianName', label: 'Physician Name', placeholder: 'Enter physician name' },
                            { name: 'patientFirstName', label: 'Patient First Name', placeholder: 'Enter first name' },
                            { name: 'patientDob', label: 'Patient Dob', placeholder: 'Enter date of birth' },
                        ].map((field, index) => (
                            <Box
                                key={index}
                                sx={{ display: 'flex', alignItems: 'center', mb: 2 }}
                            >
                                <Typography
                                    component="span"
                                    sx={{
                                        fontWeight: 'bold',
                                        width: 160,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        pr: 1,
                                        flexShrink: 0,
                                    }}
                                    title={field.label}
                                >
                                    {field.label}
                                </Typography>
                                <TextField
                                    name={field.name}
                                    variant="outlined"
                                    size="small"
                                    placeholder={field.placeholder}
                                    fullWidth
                                    sx={{ flexGrow: 1 }}
                                    value={formData[field.name]}
                                    onChange={handleInputChange}
                                    error={Boolean(errors[field.name])}
                                    helperText={errors[field.name]}
                                />
                            </Box>
                        ))}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: '300px' }}>
                        {[
                            { name: 'clinicLogo', label: 'Clinic Logo', placeholder: 'Enter logo URL or upload' },
                            { name: 'physicianContact', label: 'Physician Contact', placeholder: 'Enter contact number' },
                            { name: 'patientLastName', label: 'Patient Last Name', placeholder: 'Enter last name' },
                            { name: 'patientContact', label: 'Patient Contact', placeholder: 'Enter contact number' },
                        ].map((field, index) => (
                            <Box
                                key={index}
                                sx={{ display: 'flex', alignItems: 'center', mb: 2 }}
                            >
                                <Typography
                                    component="span"
                                    sx={{
                                        fontWeight: 'bold',
                                        width: 160,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        pr: 1,
                                        flexShrink: 0,
                                    }}
                                    title={field.label}
                                >
                                    {field.label}
                                </Typography>
                                <TextField
                                    name={field.name}
                                    variant="outlined"
                                    size="small"
                                    placeholder={field.placeholder}
                                    fullWidth
                                    sx={{ flexGrow: 1 }}
                                    value={formData[field.name]}
                                    onChange={handleInputChange}
                                    error={Boolean(errors[field.name])}
                                    helperText={errors[field.name]}
                                />
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Divider */}
                <Divider sx={{ margin: '24px 0', borderColor: '#e0e0e0' }} />

                {/* Chief Complaint Section */}
                <Box>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography sx={{ fontWeight: 'bold', color: '#333' }}>Chief Complaint</Typography>
                        <Typography sx={{ fontSize: '12px', color: '#666' }}>Max {MAX_CHAR} characters allowed</Typography>
                    </Box>
                    {/* Toolbar */}

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1, alignItems: 'center' }}>
                        {/* Undo/Redo group */}
                        <IconButton
                            disabled={!chiefEditor?.can().undo()}
                            onClick={() => chiefEditor.chain().focus().undo().run()}>
                            <UndoIcon />
                        </IconButton>
                        <IconButton
                            disabled={!chiefEditor?.can().redo()}
                            onClick={() => chiefEditor.chain().focus().redo().run()}>
                            <RedoIcon />
                        </IconButton>
                        <Divider orientation="vertical" flexItem />
                        {/* Text style group */}
                        <IconButton
                            color={chiefEditor?.isActive('bold') ? 'primary' : 'default'}
                            onClick={() => chiefEditor.chain().focus().toggleBold().run()}>
                            <FormatBoldIcon />
                        </IconButton>
                        <IconButton
                            color={chiefEditor?.isActive('italic') ? 'primary' : 'default'}
                            onClick={() => chiefEditor.chain().focus().toggleItalic().run()}>
                            <FormatItalicIcon />
                        </IconButton>
                        <IconButton
                            color={chiefEditor?.isActive('underline') ? 'primary' : 'default'}
                            onClick={() => chiefEditor.chain().focus().toggleUnderline().run()}>
                            <FormatUnderlinedIcon />
                        </IconButton>

                        <Divider orientation="vertical" flexItem />
                        <IconButton
                            color={chiefEditor?.isActive('bulletList') ? 'primary' : 'default'}
                            onClick={() => chiefEditor.chain().focus().toggleBulletList().run()}>
                            <FormatListBulletedIcon />
                        </IconButton>
                        <IconButton
                            color={chiefEditor?.isActive('orderedList') ? 'primary' : 'default'}
                            onClick={() => chiefEditor.chain().focus().toggleOrderedList().run()}>
                            <FormatListNumberedIcon />
                        </IconButton>
                        <Divider orientation="vertical" flexItem />
                        <IconButton
                            onClick={() => chiefEditor.chain().focus().setTextAlign('left').run()}>
                            <FormatAlignLeftIcon />
                        </IconButton>
                        <IconButton
                            onClick={() => chiefEditor.chain().focus().setTextAlign('center').run()}>
                            <FormatAlignCenterIcon />
                        </IconButton>
                        <IconButton
                            onClick={() => chiefEditor.chain().focus().setTextAlign('right').run()}>
                            <FormatAlignRightIcon />
                        </IconButton>
                        <IconButton
                            onClick={() => chiefEditor.chain().focus().setTextAlign('justify').run()}>
                            <FormatAlignJustifyIcon />
                        </IconButton>
                        <Divider orientation="vertical" flexItem />
                    </Box>
                    <Box
                        sx={{
                            border: '1px solid #ccc',
                            borderRadius: 1,
                            minHeight: '200px',
                            padding: 2,
                            backgroundColor: '#fff',
                            cursor: 'text',
                        }}
                        onClick={() => chiefEditor.chain().focus().run()}
                    >
                        <div style={{ border: 'none' }}>
                            <EditorContent editor={chiefEditor} />
                        </div>

                    </Box>
                </Box>
                {/* Divider */}
                <Divider sx={{ margin: '24px 0', borderColor: '#e0e0e0' }} />
                <Box>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography sx={{ fontWeight: 'bold', color: '#333' }}>
                            Consultation Note
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: '#666' }}>
                            Max {MAX_CHAR} characters allowed
                        </Typography>
                    </Box>

                    {/* Toolbar */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1, alignItems: 'center' }}>
                        {/* Undo/Redo group */}
                        <IconButton
                            disabled={!consultEditor?.can().undo()}
                            onClick={() => consultEditor.chain().focus().undo().run()}>
                            <UndoIcon />
                        </IconButton>
                        <IconButton
                            disabled={!consultEditor?.can().redo()}
                            onClick={() => consultEditor.chain().focus().redo().run()}>
                            <RedoIcon />
                        </IconButton>
                        <Divider orientation="vertical" flexItem />
                        {/* Text style group */}
                        <IconButton
                            color={consultEditor?.isActive('bold') ? 'primary' : 'default'}
                            onClick={() => consultEditor.chain().focus().toggleBold().run()}>
                            <FormatBoldIcon />
                        </IconButton>
                        <IconButton
                            color={consultEditor?.isActive('italic') ? 'primary' : 'default'}
                            onClick={() => consultEditor.chain().focus().toggleItalic().run()}>
                            <FormatItalicIcon />
                        </IconButton>
                        <IconButton
                            color={consultEditor?.isActive('underline') ? 'primary' : 'default'}
                            onClick={() => consultEditor.chain().focus().toggleUnderline().run()}>
                            <FormatUnderlinedIcon />
                        </IconButton>

                        <Divider orientation="vertical" flexItem />
                        <IconButton
                            color={consultEditor?.isActive('bulletList') ? 'primary' : 'default'}
                            onClick={() => consultEditor.chain().focus().toggleBulletList().run()}>
                            <FormatListBulletedIcon />
                        </IconButton>
                        <IconButton
                            color={consultEditor?.isActive('orderedList') ? 'primary' : 'default'}
                            onClick={() => consultEditor.chain().focus().toggleOrderedList().run()}>
                            <FormatListNumberedIcon />
                        </IconButton>
                        <Divider orientation="vertical" flexItem />
                        <IconButton
                            onClick={() => consultEditor.chain().focus().setTextAlign('left').run()}>
                            <FormatAlignLeftIcon />
                        </IconButton>
                        <IconButton
                            onClick={() => consultEditor.chain().focus().setTextAlign('center').run()}>
                            <FormatAlignCenterIcon />
                        </IconButton>
                        <IconButton
                            onClick={() => consultEditor.chain().focus().setTextAlign('right').run()}>
                            <FormatAlignRightIcon />
                        </IconButton>
                        <IconButton
                            onClick={() => consultEditor.chain().focus().setTextAlign('justify').run()}>
                            <FormatAlignJustifyIcon />
                        </IconButton>
                        <Divider orientation="vertical" flexItem />
                    </Box>
                    {/* Editor Box */}
                    <Box
                        sx={{
                            border: '1px solid #ccc',
                            borderRadius: 1,
                            minHeight: '200px',
                            padding: 2,
                            backgroundColor: '#fff',
                        }}
                        onClick={() => consultEditor.chain().focus().run()}
                    >
                        <EditorContent editor={consultEditor} />
                    </Box>
                </Box>
                <Divider sx={{ margin: '24px 0', borderColor: '#e0e0e0' }} />

                {/* Generate Report Button */}
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Button
                        variant="contained"
                        onClick={generatePDF}
                        sx={{
                            backgroundColor: '#1976d2',
                            color: '#fff',
                            textTransform: 'none',
                            fontSize: '14px',
                            fontWeight: 'normal',
                            padding: '6px 16px',
                            borderRadius: '4px',
                            '&:hover': {
                                backgroundColor: '#1565c0',
                            },
                        }}
                    >
                        Generate Report
                    </Button>
                </Box>
            </Paper>
            <div style={{ display: 'none' }}>
                <div ref={printableRef}>
                    <Box
                        sx={{
                            padding: '40px 60px', // more padding for margin space in PDF
                            fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
                            fontSize: '14px',
                            color: '#222',
                            lineHeight: 1.6,
                            backgroundColor: '#fff',
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column', // stack children vertically
                                alignItems: 'center', // center horizontally
                                justifyContent: 'center',
                                marginBottom: '15px',
                                borderBottom: '2px solid #1976d2',
                                paddingBottom: '10px',
                                textAlign: 'center',
                            }}
                        >
                            <Typography
                                variant="h5"
                                sx={{ fontWeight: '700', color: '#1976d2' }}
                            >
                                {formData.clinicName || 'Clinic Report'}
                            </Typography>
                        </Box>

                        {/* Patient Information */}
                        <Box sx={{
                            marginBottom: '30px',
                            pageBreakInside: 'avoid',
                            breakInside: 'avoid',
                        }}>
                            <Typography variant="h6" sx={{ marginBottom: '15px', fontWeight: '600', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
                                Patient Information
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
                                <Box>
                                    <Typography><strong>First Name:</strong> {formData.patientFirstName}</Typography>
                                    <Typography><strong>Last Name:</strong> {formData.patientLastName}</Typography>
                                </Box>
                                <Box>
                                    <Typography><strong>Date of Birth:</strong> {formData.patientDob}</Typography>
                                    <Typography><strong>Contact:</strong> {formData.patientContact}</Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Physician Information */}
                        <Box sx={{
                            marginBottom: '30px',
                            pageBreakInside: 'avoid',
                            breakInside: 'avoid',
                        }}>
                            <Typography variant="h6" sx={{ marginBottom: '15px', fontWeight: '600', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
                                Physician Information
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
                                <Typography><strong>Name:</strong> {formData.physicianName}</Typography>
                                <Typography><strong>Contact:</strong> {formData.physicianContact}</Typography>
                            </Box>
                        </Box>

                        {/* Chief Complaint */}
                        <Box className="pdf-section">
                            <Typography variant="h6" sx={{ marginBottom: '15px', fontWeight: '600', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
                                Chief Complaint
                            </Typography>
                            <div
                                className="pdf-content-box"
                                dangerouslySetInnerHTML={{ __html: chiefEditor?.getHTML() || '' }}
                            />
                        </Box>

                        {/* Consultation Note */}
                        <Box className="pdf-section">
                            <Typography variant="h6" sx={{ marginBottom: '15px', fontWeight: '600', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
                                Consultation Note
                            </Typography>
                            <div
                                className="pdf-content-box"
                                dangerouslySetInnerHTML={{ __html: consultEditor?.getHTML() || '' }}
                            />
                        </Box>
                    </Box>
                </div>
            </div>

        </div>
    );
};

export default MediaForm;