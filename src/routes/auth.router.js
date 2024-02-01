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
