const mongoose = require('mongoose')
const Schema = mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');

const cursoSchema = new Schema({
    nombre: {
        type: String,
        required: true,
        unique: true
    },
    descripcion: {
        type: String,
        required: true
    },
    valor: {
        type: Number,
        required: true
    },
    modalidad: {
        type: String,
        enum: {values: ['presencial', 'virtual'], message: 'Solo se permite Presencial o Virtual'}
    },
    intensidad: {
        type: Number
    },
    inscritos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    }],
    estado: {
        type: String,
        default: 'disponible',
        enum: {values: ['disponible', 'no disponible']}
    },
})

cursoSchema.plugin(uniqueValidator, { message: 'Error, {PATH} no se pede repetir.' });

const Curso = mongoose.model('Curso', cursoSchema)
module.exports = Curso

