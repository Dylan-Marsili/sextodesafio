import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import exphbs from 'express-handlebars';
import path from 'path';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';

import passport from 'passport';
import LocalStrategy from 'passport-local';
import GitHubStrategy from 'passport-github2';
import session from 'express-session';
import UserModel from './models/User';

import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';
import authRouter from './routes/auth.router.js';

const app = express();
const PORT = 8080;

app.use(session({ secret: 'my-secret-key', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Configurar passport para el login local
passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      return done(null, false, { message: 'Usuario no encontrado' });
    }

    const match = await bcrypt.compare(password, user.password);

    if (match) {
      return done(null, user);
    } else {
      return done(null, false, { message: 'Contraseña incorrecta' });
    }
  } catch (error) {
    return done(error);
  }
}));

// Configurar passport para el login con GitHub
passport.use(new GitHubStrategy({
  clientID: 'your-client-id',
  clientSecret: 'your-client-secret',
  callbackURL: 'http://localhost:8080/auth/github/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Verificar si ya existe un usuario con este ID de GitHub
    const existingUser = await UserModel.findOne({ githubId: profile.id });

    if (existingUser) {
      return done(null, existingUser);
    }

    // Crear un nuevo usuario con el ID de GitHub
    const newUser = new UserModel({
      githubId: profile.id,
      name: profile.displayName,
      email: profile.emails ? profile.emails[0].value : '',
      // Otras propiedades según tus necesidades
    });

    await newUser.save();
    return done(null, newUser);
  } catch (error) {
    return done(error);
  }
}));

// Serializar y deserializar usuarios
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/coderhouse', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Error de conexión a MongoDB:'));
db.once('open', () => {
  console.log('Conectado a MongoDB');
});

// Configuración de Handlebars
app.engine('.hbs', exphbs({ extname: '.hbs', defaultLayout: 'main', layoutsDir: path.join(__dirname, 'views/layouts') }));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

// Middleware para manejar solicitudes con cuerpo en formato JSON
app.use(express.json());

// Middleware para manejar sesiones
app.use(session({
  secret: 'my-secret-key', // Cambia esto a una clave segura
  resave: false,
  saveUninitialized: true,
}));

// Middleware para parsear el cuerpo de las solicitudes
app.use(bodyParser.urlencoded({ extended: true }));

// Rutas de la aplicación
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/auth', authRouter);
app.use('/', viewsRouter);

// Ruta para la página principal con Handlebars
app.get('/', (req, res) => {
  const user = req.session.user;
  res.render('home', { title: 'Mi Aplicación', user });
});

// Manejador de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
