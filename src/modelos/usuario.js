const mongoose = require('mongoose')
const Schema = mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');

const usuarioSchema = new Schema({

    documento:{
        type: Number,
        required: true,
        trim: true,
        unique: true
    },
    nombre:{
        type: String,
        required:  true
    },
    correo:{
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    telefono:{
        type: Number,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    tipo: {
        type: String,
        default: 'aspirante',
        enum: {values: ['aspirante', 'coordinador']}
    },
    cursos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Curso',
    }]
})
usuarioSchema.plugin(uniqueValidator, { message: 'Error, {PATH} no se pede repetir.'});

const Usuario = mongoose.model('Usuario', usuarioSchema)
module.exports = Usuario