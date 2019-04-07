// esto no se uso pero es una forma de validar y filtraciones por modificaciones en el DOM

const validarcurso = (curso) => {
    let error = 0
    let mensaje = ''
    !curso.nombre ? ((error = 1) && (mensaje = 'Nombre es requerido')) :
    !curso.id ? ((error = 1) && (mensaje = 'Id es requerido')) :
    !curso.descripcion ? ((error = 1) && (mensaje = 'Descripción es requerida')) :
    !curso.valor ? ((error = 1) && (mensaje = 'Valor es requerido')) : console.log('Válido');
    return {error , mensaje, curso}
}

module.exports = {
    validarcurso
}