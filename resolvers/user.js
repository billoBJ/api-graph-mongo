const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { combineResolvers } = require('graphql-resolvers')

const User = require('../database/models/user')
const Task = require('../database/models/task')
const { isAuthenticated }  = require('./middleware')
const PubSub = require('../subscription')
const { userEvents } = require('../subscription/events')

module.exports = {
    Query:{
        user: combineResolvers(isAuthenticated , async (_, __,{ email }) => {
            try{
                const user = User.findOne({ email }).populate()

                if(!user ){
                    throw new Error('Usuario no encontrado!')
                }

                return user
            }catch(error){

                throw error
            }

        })
    },
    Mutation:{
        signup: async (_, { input }) => {
            try{
               const user = await  User.findOne({email: input.email })
                if(user){
                    throw new Error('Email ya esta en uso.')
                }

                const hashpassword = await bcrypt.hash(input.password, 12 ) //encriptamos la pass

                const newUser = new User({...input,password: hashpassword })
                const result = await newUser.save() //guardamos el nuevo usuario

                PubSub.publish(userEvents.USER_CREATED,{
                    userCreated: result
                })

                return result
            }catch(error){
                console.log(error)
                throw error;
            }
            
        },
        login: async (_,{ input }) => {
            try{
                const user = await User.findOne({ email: input.email })
                if(!user){
                    throw new Error('Usuario no encontrado')
                }

                const isPasswordValid = await bcrypt.compare( input.password, user.password ) 

                if(!isPasswordValid){
                    throw new Error('Clave no valida.')
                }

                const secretKey = process.env.JWT_SECRET_KEY || 'secretKey123'
                const token = jwt.sign({email: user.email },secretKey,{expiresIn:'1d' })

                return { token: token }

            }catch(error){
                console.log(error)
                throw error;
            }
            

        }
    },
    Subscription:{
        userCreated:{
            subscribe: () => PubSub.asyncIterator(userEvents.USER_CREATED)
        }
    },
    User:{
        tasks: async ({ id }) =>{
            try{
                const tasks = await Task.find({ user: id })

                return tasks
            }catch(error){

                throw error
            }

        }
    }
}