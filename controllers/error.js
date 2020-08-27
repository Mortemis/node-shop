exports.notFound404 = (req, res) => {
    res.status(404).render('404', {pageTitle: '404', path:"/404"});
}

exports.error500 = (err, req, res) => {
    console.log(err);
    res.status(500).render('500', {pageTitle: 'Server error', path:"/500"});
}