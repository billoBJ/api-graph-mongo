const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const {users,tasks } = require('../constants')
const User = require('../database/models/user')


module.exports = {
    Query:{
        users: () =>{
        
            return users
        },
        user: (_, { id }) => {
        
            return users.find(user => user.id === id )
        } 
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
    User:{
        tasks:({ id }) =>{

            return tasks.filter(task => task.userId === id  )
        }
    }
}