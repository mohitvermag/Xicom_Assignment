const fs = require('fs');
const Candidate = require('../models/Candidate');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const removeUploadedFiles = (files) => {
  if (!files || !files.length) {
    return;
  }

  files.forEach((file) => {
    fs.unlink(file.path, () => {});
  });
};

const toBoolean = (value) => {
  if (typeof value === 'boolean') {
    return value;
  }

  return String(value).toLowerCase() === 'true';
};

const getAge = (dob) => {
  const birthDate = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age;
};

const matchesDocumentType = (document) => {
  if (!document.uploadedFile) {
    return false;
  }

  const extension = document.uploadedFile.originalname
    .split('.')
    .pop()
    .toLowerCase();

  if (document.fileType === 'image') {
    return ['jpg', 'jpeg', 'png'].includes(extension);
  }

  if (document.fileType === 'pdf') {
    return extension === 'pdf';
  }

  return false;
};

const getAddressValue = (body, key) => {
  if (body[key] && typeof body[key] === 'object') {
    return {
      street1: body[key].street1 || '',
      street2: body[key].street2 || '',
    };
  }

  if (typeof body[key] === 'string') {
    try {
      const parsedValue = JSON.parse(body[key]);
      if (parsedValue && typeof parsedValue === 'object') {
        return {
          street1: parsedValue.street1 || '',
          street2: parsedValue.street2 || '',
        };
      }
    } catch (error) {}
  }

  return {
    street1:
      body[`${key}.street1`] ||
      body[`${key}[street1]`] ||
      body[`${key}[0][street1]`] ||
      '',
    street2:
      body[`${key}.street2`] ||
      body[`${key}[street2]`] ||
      body[`${key}[0][street2]`] ||
      '',
  };
};

const getDocumentIndex = (fieldName) => {
  const dotMatch = fieldName.match(/^documents\.(\d+)\./);
  if (dotMatch) {
    return Number(dotMatch[1]);
  }

  const bracketMatch = fieldName.match(/^documents\[(\d+)\]/);
  if (bracketMatch) {
    return Number(bracketMatch[1]);
  }

  return null;
};

const addDocumentValue = (documentMap, index, key, value) => {
  if (index === null || Number.isNaN(index)) {
    return;
  }

  if (!documentMap[index]) {
    documentMap[index] = {};
  }

  documentMap[index][key] = value;
};

const getDocumentsFromBody = (body) => {
  if (!body.documents) {
    return [];
  }

  if (Array.isArray(body.documents)) {
    return body.documents;
  }

  if (typeof body.documents === 'string') {
    try {
      const parsedValue = JSON.parse(body.documents);
      return Array.isArray(parsedValue) ? parsedValue : [];
    } catch (error) {
      return [];
    }
  }

  return [];
};

const buildDocuments = (body, files) => {
  const documentMap = {};
  const documentsFromBody = getDocumentsFromBody(body);

  documentsFromBody.forEach((document, index) => {
    addDocumentValue(documentMap, index, 'fileName', document.fileName || '');
    addDocumentValue(documentMap, index, 'fileType', document.fileType || '');
  });

  Object.keys(body).forEach((key) => {
    const dotMatch = key.match(/^documents\.(\d+)\.(fileName|fileType)$/);
    if (dotMatch) {
      addDocumentValue(documentMap, Number(dotMatch[1]), dotMatch[2], body[key]);
      return;
    }

    const bracketMatch = key.match(/^documents\[(\d+)\]\[(fileName|fileType)\]$/);
    if (bracketMatch) {
      addDocumentValue(documentMap, Number(bracketMatch[1]), bracketMatch[2], body[key]);
    }
  });

  files.forEach((file, index) => {
    const documentIndex = getDocumentIndex(file.fieldname);
    const finalIndex = documentIndex !== null ? documentIndex : index;

    if (!documentMap[finalIndex]) {
      documentMap[finalIndex] = {};
    }

    documentMap[finalIndex].uploadedFile = file;
  });

  return Object.keys(documentMap)
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => ({
      fileName: documentMap[key].fileName || '',
      fileType: documentMap[key].fileType || '',
      fileUrl: documentMap[key].uploadedFile
        ? `/uploads/${documentMap[key].uploadedFile.filename}`
        : '',
      uploadedFile: documentMap[key].uploadedFile || null,
    }));
};

const validateCandidateData = (candidateData) => {
  const {
    firstName,
    lastName,
    email,
    dob,
    residentialAddress,
    permanentAddress,
    sameAsResidential,
    documents,
  } = candidateData;

  if (!firstName || !lastName || !email || !dob) {
    return 'All personal details are required';
  }

  if (!emailPattern.test(email)) {
    return 'Please enter a valid email address';
  }

  const birthDate = new Date(dob);

  if (Number.isNaN(birthDate.getTime())) {
    return 'Please enter a valid date of birth';
  }

  if (getAge(dob) < 18) {
    return 'Candidate must be at least 18 years old';
  }

  if (!residentialAddress.street1 || !residentialAddress.street2) {
    return 'Residential address is required';
  }

  if (
    !sameAsResidential &&
    (!permanentAddress.street1 || !permanentAddress.street2)
  ) {
    return 'Permanent address is required';
  }

  if (!documents.length || documents.length < 2) {
    return 'Minimum 2 documents required';
  }

  for (const document of documents) {
    if (!document.fileName || !document.fileType || !document.uploadedFile) {
      return 'Each document must include file name, file type, and file upload';
    }

    if (!['image', 'pdf'].includes(document.fileType)) {
      return 'Document file type must be image or pdf';
    }

    if (!matchesDocumentType(document)) {
      return `Uploaded file does not match selected type for ${document.fileName}`;
    }
  }

  return null;
};

const createCandidate = async (req, res) => {
  const uploadedFiles = req.files || [];

  try {
    const sameAsResidential = toBoolean(req.body.sameAsResidential);
    const residentialAddress = getAddressValue(req.body, 'residentialAddress');
    const permanentAddress = sameAsResidential
      ? { ...residentialAddress }
      : getAddressValue(req.body, 'permanentAddress');
    const documents = buildDocuments(req.body, uploadedFiles);

    const candidateData = {
      firstName: (req.body.firstName || '').trim(),
      lastName: (req.body.lastName || '').trim(),
      email: (req.body.email || '').trim().toLowerCase(),
      dob: (req.body.dob || req.body.dateOfBirth || '').trim(),
      residentialAddress: {
        street1: (residentialAddress.street1 || '').trim(),
        street2: (residentialAddress.street2 || '').trim(),
      },
      permanentAddress: {
        street1: (permanentAddress.street1 || '').trim(),
        street2: (permanentAddress.street2 || '').trim(),
      },
      sameAsResidential,
      documents,
    };

    const validationMessage = validateCandidateData(candidateData);

    if (validationMessage) {
      removeUploadedFiles(uploadedFiles);
      return res.status(400).json({
        success: false,
        message: validationMessage,
      });
    }

    const candidate = new Candidate({
      firstName: candidateData.firstName,
      lastName: candidateData.lastName,
      email: candidateData.email,
      dob: candidateData.dob,
      residentialAddress: candidateData.residentialAddress,
      permanentAddress: candidateData.permanentAddress,
      sameAsResidential: candidateData.sameAsResidential,
      documents: candidateData.documents.map((document) => ({
        fileName: document.fileName,
        fileType: document.fileType,
        fileUrl: document.fileUrl,
      })),
    });

    const savedCandidate = await candidate.save();

    return res.status(201).json({
      success: true,
      message: 'Candidate submitted successfully',
      data: savedCandidate,
    });
  } catch (error) {
    removeUploadedFiles(uploadedFiles);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while submitting candidate',
    });
  }
};

const getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Candidates fetched successfully',
      data: candidates,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while fetching candidates',
    });
  }
};

module.exports = {
  createCandidate,
  getCandidates,
};
