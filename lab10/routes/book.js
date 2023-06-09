const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')


const sqlite3 = require('sqlite3')
const { text } = require('express')
const db = new sqlite3.Database('./books.sqlite');

const bodyParser = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// /admin/add
router.get('/', (req, res, next) => {
	console.log(req.query);
	
	if ('isbn' in req.query) {
		db.all("SELECT * FROM books WHERE isbn=$isbn", {$isbn: req.query.isbn}, function(err, row) {
			// if (row.length == 1) {
				
				let curbook = row[0];
			
				fs.readFile(path.join(__dirname, '..', 'views', 'detail.html'), 'utf8', (err, page) => {
					if (err) {
						console.error(err);
						return;
					}

					page = page.replace('{%isbn%}', curbook.isbn)
					page = page.replace('{%title%}', curbook.title)
					page = page.replace('{%author%}', curbook.author)
					page = page.replace('{%description%}', curbook.description)

					res.setHeader('Content-Type', 'text/html')
					res.write(page)
					res.end();
				});
			// } else {
			// 	res.status(404).sendFile(path.join(__dirname, '..', 'views', '404.html'))
			// }
		})
	} else {	
		res.status(404).sendFile(path.join(__dirname, '..', 'views', '404.html'))
	}

})

router.get('/newBook', (req, res) => { // opens the newBook.html

	fs.readFile(path.join(__dirname, '..', 'views', 'newBook.html'), 'utf8', (err, page) => {
		if (err) {
			console.error(err);
			return;
		}
		res.setHeader('Content-Type', 'text/html')
		res.write(page)
		res.end();
	});
})

router.post('/newBook', urlencodedParser, (req, res) => {

	var isbn = req.body.isbn;
	var title = req.body.title;
	var author = req.body.author;
	var description = req.body.description;

	db.all("INSERT INTO books (isbn, title, author, description) VALUES (?,?,?,?)", [isbn, title, author, description], function(err, rows) {
		if (err) {
			console.error(err);
			return;
		}
		res.redirect('/');
	})
})

router.get('/delete', (req, res, next) => {
	var isbn = req.query.isbn;
	
	if ('isbn' in req.query) {
		
		db.all("DELETE FROM books where isbn = ?",[isbn], function(err, rows){
			if (err) {
				console.error(err);
				return;
			}
			res.redirect('/');
			
		})
	} else {
		res.status(404).sendFile(path.join(__dirname, '..', 'views', 'bookNotFound.html')) // opens a new page like "page not found"
	}

})

module.exports = router; 