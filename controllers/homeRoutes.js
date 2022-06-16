const router = require('express').Router();
const { Post, Comment, User } = require('../models');
const withAuth = require('../utils/auth');

router.get('/', async (req, res) => {
  try {
    let userText;
    let name;
    const postData = await Post.findAll({
      include: [
        {
          model: User,
        },
      ],
    });

    // Serialaize data so the template can read it
    const blogs = postData.map((post) => post.get({ plain: true }));
    if (req.session.logged_in) {
      const userData = await User.findByPk(req.session.user_id, {
        attributes: { exclude: ['password'] },
      });

      userText = userData.get({ plain: true });
      name = userText['username'];
      console.log('user', name);
    }
    res.render('homepage', {
      blogs,
      logged_in: req.session.logged_in,
      name: req.session.name,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/blogs/:id', async (req, res) => {
  try {
    const postData = await Post.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['username'],
        },
        {
          model: Comment,
          include: [
            {
              model: User,
              attributes: ['username'],
            },
          ],
        },
      ],
    });

    const blog = postData.get({ plain: true });
    console.log(blog);
    res.render('blog-page', {
      ...blog,
      logged_in: req.session.logged_in,
      name: req.session.name,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Use withAuth middleware to prevent access to route
// router.get('/dashboard', withAuth, async (req, res) => {
router.get('/dashboard', withAuth, async (req, res) => {
  try {
    // Find the logged in user based on the session ID
    const userData = await User.findByPk(req.session.user_id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Post }],
    });

    const user = userData.get({ plain: true });

    console.log('user', user);
    res.render('dashboard', {
      ...user,
      logged_in: req.session.logged_in,
      name: req.session.name,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/create-blog', async (req, res) => {
  try {
    res.render('create-blog', {
      logged_in: req.session.logged_in,
      name: req.session.name,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/edit-post/:id', withAuth, async (req, res) => {
  try {
    // Find the logged in user based on the session ID
    const userData = await User.findByPk(req.session.user_id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Post }],
    });

    const user = userData.get({ plain: true });
    console.log('USSer', user['Posts'][1]);
    let post;
    for (i = 0; i < user['Posts'].length; i++) {
      console.log(user['Posts'][i].id);
      if (user['Posts'][i].id == req.params.id) {
        post = user['Posts'][i];
        console.log(post);
      }
    }
    console.log('Posts', post);

    res.render('edit-post', {
      ...post,
      logged_in: req.session.logged_in,
      name: req.session.name,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/login', (req, res) => {
  // If the user is already logged in, redirect the request to another route
  if (req.session.logged_in) {
    res.redirect('/dashboard');
    return;
  }

  res.render('login');
});

module.exports = router;
