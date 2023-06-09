const BookInstance = require("../models/bookinstance");
const Book = require("../models/book");

const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.bookinstance_list = asyncHandler(async (req, res, next) => {
  const allBookInstances = await BookInstance.find().populate("book").exec();

  res.render("bookinstance_list", {
    title: "Book Instances List",
    bookinstance_list: allBookInstances,
  });
});

exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id)
    .populate("book")
    .exec();

  if (bookInstance === null) {
    const err = new Error("Book copy not found");
    err.status = 404;
    return next(err);
  }

  res.render("bookinstance_detail", {
    title: "Book:",
    bookinstance: bookInstance,
  });
});

exports.bookinstance_create_get = asyncHandler(async (req, res, next) => {
  const allBooks = await Book.find({}, "title").exec();

  res.render("bookinstance_form", {
    title: "Create BookInstance",
    book_list: allBooks,
    selected_book: undefined,
    errors: [],
    bookinstance: undefined,
  });
});

exports.bookinstance_create_post = [
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("due_back", "Invalid date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });

    if (!errors.isEmpty()) {
      const allBooks = await Book.find({}, "title").exec();

      res.render("bookinstance_form", {
        title: "Create BookInstance",
        book_list: allBooks,
        selected_book: bookInstance.book._id,
        errors: errors.array(),
        bookinstance: bookInstance,
      });
      return;
    } else {
      await bookInstance.save();
      res.redirect(bookInstance.url);
    }
  }),
];

exports.bookinstance_delete_get = asyncHandler(async (req, res, next) => {
  const bookinstance = await BookInstance.findById(req.params.id).exec();

  if (bookinstance === null) {
    res.redirect("/catalog/bookinstances");
  }

  res.render("bookinstance_delete", {
    title: "Delete Bookinstance",
    bookinstance: bookinstance,
  });
});

exports.bookinstance_delete_post = asyncHandler(async (req, res, next) => {
  const bookinstance = await BookInstance.findById(req.params.id).exec();

  await BookInstance.findByIdAndRemove(req.body.bookinstanceid);
  res.redirect("/catalog/bookinstances");
});

exports.bookinstance_update_get = asyncHandler(async (req, res, next) => {
  const [bookinstance, books] = await Promise.all([
    BookInstance.findById(req.params.id).populate("book").exec(),
    Book.find().exec(),
  ]);

  if (bookinstance === null) {
    var err = new Error("Book copy not found");
    err.status = 404;
    return next(err);
  }

  res.render("bookinstance_form", {
    title: "Update BookInstance",
    book_list: books,
    selected_book: bookinstance.book._id,
    bookinstance: bookinstance,
    errors: [],
  });
});

exports.bookinstance_update_post = [
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("due_back", "Invalid date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      const books = await Book.find({}, "title").exec();

      res.render("bookinstance_form", {
        title: "Update BookInstance",
        book_list: books,
        selected_book: bookinstance.book._id,
        bookinstance: bookinstance,
        errors: errors.array(),
      });
      return;
    } else {
      const thebookinstance = await BookInstance.findByIdAndUpdate(
        req.params.id,
        bookinstance,
        {}
      );
      res.redirect(thebookinstance.url);
    }
  }),
];
