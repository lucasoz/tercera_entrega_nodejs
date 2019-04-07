import express from 'express'
import path from 'path';
import hbs from 'hbs';
import helpers from './helpers';
import bodyParser from 'body-parser';
import funciones from './funciones';
import mongoose from 'mongoose'
import Usuario from './modelos/usuario'
import Curso from './modelos/curso'
import bcrypt from 'bcrypt'
import session from 'express-session'
import memoryStore from 'memorystore'

const memorystore = memoryStore(session)

const app = express()

const dirPublic = path.join(__dirname, '../public')
const directoriopartials = path.join(__dirname,'../partials')

mongoose.connect('mongodb://localhost:27017/sistema_academico', {useNewUrlParser: true}, (err, resultado) => {
	if (err) {
		return console.log(err)
	}
	console.log('conectado a mongodb');
	
});

app.use(session({
    cookie: { maxAge: 86400000 },
    store: new memorystore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    secret: 'keyboard cat'
}))

app.use(express.static(dirPublic))
hbs.registerPartials(directoriopartials)
app.use(bodyParser.urlencoded({extended: false}))

app.set('view engine', 'hbs')

app.get('/', (req, res) => {
    res.render('index', {
        funcion: 'Página principal'
    })
})

// rutas coordinador

app.get('/registro', (req, res) => {
    res.render('registro', {
        funcion : "Registrarse", 
    })
})

app.post('/registro', (req, res) => {
    console.log(req.body);
    let usuario = new Usuario({
        documento: req.body.documento,
        nombre: req.body.nombre,
        correo: req.body.correo,
        telefono: req.body.telefono,
        password: bcrypt.hashSync(req.body.password, 10),
    })

    usuario.save((err, resultado) => {
		if(err){            
            let error_message = err.errors.documento ? err.errors.documento.message : err.errors.correo ? err.errors.correo.message : ''
		    return res.render('registro', {
                funcion : "Registrarse", 
                hayerror: true,		
                error: error_message,
			})
		}
		res.redirect('/listar-cursos')
	})
})

app.get('/login', (req, res) => {
    res.render('login', {
        funcion : "Iniciar sesión", 
    })
})

app.post('/login', (req, res) => {
    Usuario.findOne({correo: req.body.correo}, (err , respuesta) => {
        if(err){
            return console.log(err)
        }

        if(!respuesta){
            return res.render('login', {
                funcion : "Iniciar sesión", 
                error: "Contraseña incorrecta"
            })
        }

        if(!bcrypt.compareSync(req.body.password, respuesta.password)){
            return res.render('login', {
                funcion : "Iniciar sesión", 
                error: "Contraseña incorrecta"
            })
        }

        req.session.usuario = respuesta._id
        console.log(req.session);
        
        res.redirect('/listar-cursos')

    })
})

app.get('/crear-cursos', (req, res) => {
    res.render('crearCursos', {
        funcion : "Crear un curso", 
    })
})

app.post('/crear-cursos', (req, res) => { 
    let curso = new Curso({
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        valor: req.body.valor,
        modalidad: req.body.modalidad,
        intensidad: req.body.intensidad,
    })

    curso.save((err, resultado) => {
		if(err){            
            let error_message = err.errors.modalidad ? err.errors.modalidad.message : err.errors.nombre ? err.errors.nombre.message : ''
		    return res.render('crearCursos', {
                funcion : "Crear un curso", 
                hayerror: true,		
                error: error_message,
                curso: curso
			})
		}
		res.redirect('/listar-cursos')
	})

})


app.get('/ver-inscritos', (req, res) => {
    const id = req.query.id
    let respuesta = ''
    id && (respuesta = funciones.cambiarEstado(id))
    const cursos = funciones.mostrarCursosDisponibles()
    res.render('verInscritos', {
        funcion : "Ver inscritos", 
        cursos,
        mensaje: respuesta
    })
})


app.get('/eliminar-personas',(req, res) => {
    const idCurso = req.query.idCurso
    const idAsp = req.query.idAsp
    idCurso && idAsp && funciones.eliminarAspCur(idCurso,idAsp)    
    const cursos = funciones.mostrarCursosDisponibles()
    res.render('eliminarPersonas', {
        funcion : "Eliminar personas", 
        cursos
    })
})

// rutas aspirantes
app.get('/inscribirme',(req, res) => {
    Curso.find({estado: 'disponible'},{nombre: 1}).exec((err, respuesta) => {
        if (err) {
			return console.log('err')
        }

        
		res.render('inscribirme', {
            funcion : "Inscripción a un curso", 
            cursos: respuesta
        })
    })
})


app.post('/inscribirme',(req, res) => {
    // console.log(req.body.curso)
    // const respuesta = funciones.inscribirme(req.body)
    // respuesta.error == 1 ? res.render('inscribirme', {
    //     funcion : "Inscripción a un curso", 
    //     error: respuesta.mensaje,
    //     hayerror: respuesta.error == 1,
    //     asp: respuesta.asp,
    //     cursos: funciones.cursosId()
    // }) : res.render('inscribirme', {
    //     funcion : "Inscripción a un curso", 
    //     hayerror: respuesta.error == 1,
    //     error: respuesta.mensaje,
    //     cursos: funciones.cursosId()
    // })
})


//rutas interesados
app.get('/listar-cursos',(req, res) => {
    Curso.find({estado: 'disponible'}).exec((err, respuesta) => {
        if (err) {
			return console.log('err')
		}
		res.render('listarCursos', {
            funcion : "Lista de cursos", 
            cursos: respuesta
        })
    })
})

app.get('*', (req, res) => {
    res.render('error', {
        estudiante: 'error',
        funcion: 'Error'
    })
})

app.listen(3000, () => {
    console.log('Escuchando en el puerto 3000')
})
