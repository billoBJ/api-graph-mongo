const { skip } = require('graphql-resolvers')

const Task = require('../../database/models/task')
const { isValidObjectId } = require('../../database/util')

module.exports.isAuthenticated = (_,__, { email }) => {
    //Verifica que el usuario este autenticado
    if(!email){
        throw new Error('Acceso denegado.')
    }

    return skip
}

module.exports.isTaskOwner = async (_,{ id }, { loggedInUserId }) => {
    //Verifica que la tarea sea del usuario autenticado
    try{
        if(!isValidObjectId(id)){
            throw new Error('Id no valido.')
        }

        const task = await Task.findById(id)
        if(!task){
            throw new Error('Tarea no encontrada.')
        }else if(task.user.toString() !== loggedInUserId ){
            throw new Error('No posee autorizacion sobre la tarea')
        }

        return skip
    }catch(error){
        throw error
    }

}