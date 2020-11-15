const bcrypt = require('bcryptjs')

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
            
        }
    },
    User:{
        tasks:({ id }) =>{

            return tasks.filter(task => task.userId === id  )
        }
    }
}