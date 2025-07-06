const { User } = require('../models')
const bcrypt = require('bcrypt')

const userServices = {
  signup: async (req) => {
    const { name, email, password, confirmPassword } = req.body
    if (password !== confirmPassword) {
      throw new Error('Password and confirm password do not match')
    }
    const user = await User.findOne({ where: { email } })
    if (user) throw new Error('Email already exists')
    const newUser = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 10)
    })
    return newUser
  }
}

module.exports = userServices
