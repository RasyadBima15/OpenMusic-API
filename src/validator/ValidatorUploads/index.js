const InvariantError = require('../../exceptions/InvariantError');
const { mimHeaderSchema } = require('./schema');

const UploadsValidator = {
    validateMimHeaders: (headers) => {
        const validationResult =  mimHeaderSchema.validate(headers);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
        return validationResult.value;
    }
}
module.exports = UploadsValidator;