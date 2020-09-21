const Razorpay = require('razorpay');

var instance = new Razorpay({
    key_id: '',
    key_secret: ''
  })

module.exports = instance;