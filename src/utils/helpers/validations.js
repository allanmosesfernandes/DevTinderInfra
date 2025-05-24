const validator = require('validator');

const nameValidator = {
  validator: function (value) {
    // Allow letters and spaces only.
    return validator.isAlpha(value.replace(/ /g, ''), 'en-US');
  },
  message: props => `${props.value} is not a valid name. Only letters and spaces are allowed.`,
};

module.exports = { nameValidator };
