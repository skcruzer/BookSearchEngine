const { AuthenticationError } = require('apollo-server-express')
const { User } = require('../models')
// import sign token function from auth
const { signToken } = require('../utils/auth')

const resolvers = {
  Query: {
    me: async (parents, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id }).select('-__v -password')

        return userData
      }
      throw new AuthenticationError('Not logged in')
    },
  },
  Mutation: {
    addUser: async (parents, args) => {
      const user = await User.create(args)
      const token = signToken(user)

      return { token, user }
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email })

      // if user logs in with incorrect username, throw error
      if (!user) {
        throw new AuthenticationError('Incorrect credentials, please try again')
      }
      
      const correctPw = await user.isCorrectPassword(password)

      // if user logs in with incorrect password, throw error
      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials, please try again')
      }

      const token = signToken(user)
      return { token, user }
    },

    saveBook: async (parent, { bookData }, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $push: { savedBooks: bookData } },
          { new: true }
        )
        return updatedUser
      }
      throw new AuthenticationError('You need to be logged in!')
    },
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        )
        return updatedUser
      }
      throw new AuthenticationError('You need to be logged in!')
    },
  },
}

module.exports = resolvers