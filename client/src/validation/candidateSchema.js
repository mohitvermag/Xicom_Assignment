import { z } from 'zod'

const requiredAddressSchema = z.object({
  street1: z.string().trim().min(1, 'Street 1 is required'),
  street2: z.string().trim().min(1, 'Street 2 is required'),
})

const optionalAddressSchema = z.object({
  street1: z.string().trim(),
  street2: z.string().trim(),
})

function getAge(dateOfBirth) {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)

  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDifference = today.getMonth() - birthDate.getMonth()

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1
  }

  return age
}

function getFileExtension(fileName) {
  const nameParts = fileName.split('.')
  return nameParts[nameParts.length - 1].toLowerCase()
}

function hasUploadedFile(value) {
  return value && value.length > 0 && value[0]
}

const documentSchema = z
  .object({
    fileName: z.string().trim().min(1, 'File name is required'),
    fileType: z.enum(['image', 'pdf']),
    file: z.any(),
  })
  .superRefine((value, ctx) => {
    if (!hasUploadedFile(value.file)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['file'],
        message: 'File upload is required',
      })
      return
    }

    const selectedFile = value.file[0]
    const extension = getFileExtension(selectedFile.name)
    const imageExtensions = ['jpg', 'jpeg', 'png']

    if (value.fileType === 'image' && !imageExtensions.includes(extension)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['file'],
        message: 'Only JPG, JPEG, and PNG files are allowed',
      })
    }

    if (value.fileType === 'pdf' && extension !== 'pdf') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['file'],
        message: 'Only PDF files are allowed',
      })
    }
  })

export const candidateSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required'),
    lastName: z.string().trim().min(1, 'Last name is required'),
    email: z
      .string()
      .trim()
      .min(1, 'Email is required')
      .email('Enter a valid email address'),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    sameAsResidential: z.boolean(),
    residentialAddress: requiredAddressSchema,
    permanentAddress: optionalAddressSchema,
    documents: z.array(documentSchema).min(1, 'Please add at least 1 document'),
  })
  .superRefine((value, ctx) => {
    const birthDate = new Date(value.dateOfBirth)

    if (Number.isNaN(birthDate.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dateOfBirth'],
        message: 'Date of birth is required',
      })
    } else if (getAge(value.dateOfBirth) < 18) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dateOfBirth'],
        message: 'Candidate must be at least 18 years old',
      })
    }

    if (!value.sameAsResidential) {
      if (!value.permanentAddress.street1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['permanentAddress', 'street1'],
          message: 'Street 1 is required',
        })
      }

      if (!value.permanentAddress.street2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['permanentAddress', 'street2'],
          message: 'Street 2 is required',
        })
      }
    }
  })
