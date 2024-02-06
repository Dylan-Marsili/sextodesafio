// auth.router.js
import { Router } from 'express';
import passport from 'passport';

const authRouter = Router();

authRouter.get('/login', (req, res) => {
  res.render('login');
});

authRouter.post('/login', passport.authenticate('local', {
  successRedirect: '/products',
  failureRedirect: '/auth/login',
  failureFlash: true,
}));

authRouter.get('/register', (req, res) => {
  res.render('register');
});

authRouter.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      return res.render('register', { error: 'El usuario ya existe' });
    }

    // Crear un nuevo usuario
    const newUser = new UserModel({ name, email, password });

    await newUser.save();
    res.redirect('/auth/login');
  } catch (error) {
    console.error(error);
    res.render('register', { error: 'Error al registrar el usuario' });
  }
});

authRouter.get('/github', passport.authenticate('github'));

authRouter.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: '/auth/login' }),
  (req, res) => {
    res.redirect('/products');
  }
);

authRouter.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/auth/login');
});

export default authRouter;
