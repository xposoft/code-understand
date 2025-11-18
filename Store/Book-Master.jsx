"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MainContentPage from "../../components/MainContent/MainContentPage";
import { Form, Button, Row, Col, Container, Table, Spinner } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useAuthContext } from "../../Context/AuthContext";
import { ENDPOINTS } from "../../SpringBoot/config";
import axios from "axios";

// Add/Edit Book Modal Component
const AddBookModal = ({ isOpen, onClose, onConfirm, book, categories }) => {
  const [bookName, setBookName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    if (book) {
      setBookName(book.bookName || "");
      setAmount(book.amount || "");
      setCategory(book.category || "");
    } else {
      setBookName("");
      setAmount("");
      setCategory("");
    }
  }, [book]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!bookName.trim()) {
      toast.error("Book Name is required");
      return;
    }
    if (!amount || isNaN(amount) || amount < 0) {
      toast.error("Valid Amount is required");
      return;
    }
    onConfirm(bookName, amount, category);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">{book ? "Edit Book" : "Add Book"}</h2>
        <div className="modal-body">
          <Row>
            <Col xs={12}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Book Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Book Name"
                  value={bookName}
                  onChange={(e) => setBookName(e.target.value)}
                  className="custom-input"
                  required
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Amount</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="custom-input"
                  min="0"
                  step="0.01"
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Category</Form.Label>
                <Form.Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="custom-input"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.categoryName}>
                      {cat.categoryName} ({cat.accountHead || "N/A"})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </div>
        <div className="modal-footer">
          <Button className="modal-button cancel" onClick={onClose}>
            Cancel
          </Button>
          <Button className="modal-button confirm" onClick={handleSubmit}>
            {book ? "Update" : "Add"}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Delete Book Modal Component
const DeleteBookModal = ({ isOpen, onClose, onConfirm, book }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Delete Book</h2>
        <div className="modal-body text-center">
          <p>Are you sure you want to delete this book?</p>
          <p className="fw-bold">{book?.bookName}</p>
        </div>
        <div className="modal-footer">
          <Button className="modal-button cancel" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="modal-button delete"
            onClick={() => onConfirm(book.id)}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

// Confirm Edit Modal Component
const ConfirmEditModal = ({
  isOpen,
  onClose,
  onConfirm,
  currentBook,
  newBook,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Confirm Edit</h2>
        <div className="modal-body">
          <p>
            Are you sure you want to edit this book? This may affect related
            data.
          </p>
          <Table bordered responsive>
            <thead>
              <tr>
                <th>Field</th>
                <th>Current Value</th>
                <th>New Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Book Name</td>
                <td>{currentBook?.bookName || "N/A"}</td>
                <td>{newBook?.bookName || "N/A"}</td>
              </tr>
              <tr>
                <td>Amount</td>
                <td>{currentBook?.amount || "N/A"}</td>
                <td>{newBook?.amount || "N/A"}</td>
              </tr>
              <tr>
                <td>Category</td>
                <td>{currentBook?.category || "None"}</td>
                <td>{newBook?.category || "None"}</td>
              </tr>
            </tbody>
          </Table>
        </div>
        <div className="modal-footer">
          <Button className="modal-button cancel" onClick={onClose}>
            Cancel
          </Button>
          <Button className="modal-button confirm" onClick={onConfirm}>
            Confirm Edit
          </Button>
        </div>
      </div>
    </div>
  );
};

const BookMaster = () => {
  const { user, currentAcademicYear, schoolId } = useAuthContext();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isConfirmEditModalOpen, setIsConfirmEditModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [newBook, setNewBook] = useState(null);
  const [loading, setLoading] = useState({ books: false, categories: false });
  const BOOKS_URL = `${ENDPOINTS.store}/books`;
  const CATEGORIES_URL = `${ENDPOINTS.store}/categories`;

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    "X-School-ID": schoolId,
    "X-Academic-Year": currentAcademicYear,
  });

  const fetchBooks = async () => {
    if (!schoolId || !currentAcademicYear) return;

    try {
      setLoading((prev) => ({ ...prev, books: true }));
      const res = await axios.get(BOOKS_URL, {
        params: { schoolId, year: currentAcademicYear },
        headers: getAuthHeaders(),
      });
      setBooks(res.data || []);
    } catch (error) {
      console.error("Error fetching books:", error);
      toast.error(`Failed to fetch books: ${error.message}`);
    } finally {
      setLoading((prev) => ({ ...prev, books: false }));
    }
  };

  const fetchCategories = async () => {
    if (!schoolId || !currentAcademicYear) return;

    try {
      setLoading((prev) => ({ ...prev, categories: true }));
      const res = await axios.get(CATEGORIES_URL, {
        params: { schoolId, year: currentAcademicYear },
        headers: getAuthHeaders(),
      });
      setCategories(res.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error(`Failed to fetch categories: ${error.message}`);
    } finally {
      setLoading((prev) => ({ ...prev, categories: false }));
    }
  };

  useEffect(() => {
    if (user && schoolId && currentAcademicYear) {
      fetchBooks();
      fetchCategories();
    }
  }, [user, schoolId, currentAcademicYear]);

  const handleAddBook = async (bookName, amount, category) => {
    if (!schoolId || !currentAcademicYear) {
      toast.error("School or academic year not initialized");
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, books: true }));
      await axios.post(
        BOOKS_URL,
        {
          bookName,
          amount: parseFloat(amount),
          category,
          academicYear: currentAcademicYear,
        },
        {
          params: { schoolId, year: currentAcademicYear },
          headers: getAuthHeaders(),
        }
      );
      setIsAddModalOpen(false);
      toast.success("Book added successfully!", {
        style: { background: "#0B3D7B", color: "white" },
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
      });
      await fetchBooks();
    } catch (error) {
      console.error("Error adding book:", error);
      toast.error(
        `Failed to add book: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setLoading((prev) => ({ ...prev, books: false }));
    }
  };

  const handleEditBook = async (bookName, amount, category) => {
    if (!schoolId || !currentAcademicYear || !selectedBook) {
      toast.error("School, academic year, or book not initialized");
      return;
    }

    setIsAddModalOpen(false);
    setNewBook({ bookName, amount: parseFloat(amount), category });
    setIsConfirmEditModalOpen(true);
  };

  const confirmEditBook = async () => {
    try {
      setLoading((prev) => ({ ...prev, books: true }));
      await axios.put(
        `${BOOKS_URL}/${selectedBook.id}`,
        { ...newBook, academicYear: currentAcademicYear },
        {
          params: { schoolId, year: currentAcademicYear },
          headers: getAuthHeaders(),
        }
      );
      setIsConfirmEditModalOpen(false);
      setSelectedBook(null);
      setNewBook(null);
      toast.success("Book updated successfully!", {
        style: { background: "#0B3D7B", color: "white" },
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
      });
      await fetchBooks();
    } catch (error) {
      console.error("Error updating book:", error);
      toast.error(
        `Failed to update book: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setLoading((prev) => ({ ...prev, books: false }));
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!schoolId || !currentAcademicYear) {
      toast.error("School or academic year not initialized");
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, books: true }));
      await axios.delete(`${BOOKS_URL}/${bookId}`, {
        params: { schoolId },
        headers: getAuthHeaders(),
      });
      setIsDeleteModalOpen(false);
      setSelectedBook(null);
      toast.success("Book deleted successfully!", {
        style: { background: "#0B3D7B", color: "white" },
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
      });
      await fetchBooks();
    } catch (error) {
      console.error("Error deleting book:", error);
      toast.error(
        `Failed to delete book: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setLoading((prev) => ({ ...prev, books: false }));
    }
  };

  const openEditModal = (book) => {
    setSelectedBook(book);
    setIsAddModalOpen(true);
  };

  const openDeleteModal = (book) => {
    setSelectedBook(book);
    setIsDeleteModalOpen(true);
  };

  const filteredBooks = books.filter((book) =>
    book.bookName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainContentPage>
      <Container fluid className="px-0 px-lg-0">
        <nav className="custom-breadcrumb py-1 py-lg-3">
          <Link to="/home">Home</Link>
          <span className="separator">&gt;</span>
          <span>Store</span>
          <span className="separator">&gt;</span>
          <span className="current">Book Master</span>
        </nav>
        <Row>
          <Col xs={12}>
            <div className="book-master-container">
              <div className="form-card mt-3">
                <div
                  className="header p-3 d-flex justify-content-between align-items-center"
                  style={{ backgroundColor: "#0B3D7B", color: "white" }}
                >
                  <h2 className="m-0 d-none d-lg-block">Book Master</h2>
                  <h6 className="m-0 d-lg-none">Book Master</h6>
                  <Button
                    onClick={() => {
                      setSelectedBook(null);
                      setIsAddModalOpen(true);
                    }}
                    className="btn btn-light text-dark"
                    disabled={
                      loading.books || !schoolId || !currentAcademicYear
                    }
                  >
                    + Add Book
                  </Button>
                </div>
                <div className="content-wrapper p-4">
                  {loading.books ? (
                    <div className="text-center py-5">
                      <Spinner
                        animation="border"
                        role="status"
                        style={{ color: "#0B3D7B" }}
                      >
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                      <p className="mt-2">Loading books...</p>
                    </div>
                  ) : !schoolId || !currentAcademicYear ? (
                    <div className="alert alert-warning">
                      Please select an academic year and school to manage books.
                    </div>
                  ) : (
                    <>
                      <div className="d-flex mb-3">
                        <Form.Control
                          type="text"
                          placeholder="Search by Book Name"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="custom-search me-2"
                          disabled={loading.books}
                        />
                        <Button
                          variant="danger"
                          onClick={() => setSearchTerm("")}
                          disabled={loading.books || !searchTerm}
                        >
                          Reset
                        </Button>
                      </div>
                      <div className="table-responsive">
                        {filteredBooks.length === 0 ? (
                          <div className="alert alert-info">
                            No books found. Add a new book to get started.
                          </div>
                        ) : (
                          <Table bordered hover>
                            <thead
                              style={{
                                backgroundColor: "#0B3D7B",
                                color: "white",
                              }}
                            >
                              <tr>
                                <th>Book Name</th>
                                <th>Amount</th>
                                <th>Category</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredBooks.map((book) => (
                                <tr key={book.id}>
                                  <td>{book.bookName}</td>
                                  <td>{book.amount}</td>
                                  <td>{book.category || "None"}</td>
                                  <td>
                                    <Button
                                      variant="link"
                                      className="action-button edit-button me-2"
                                      onClick={() => openEditModal(book)}
                                      disabled={loading.books}
                                    >
                                      <FaEdit />
                                    </Button>
                                    <Button
                                      variant="link"
                                      className="action-button delete-button"
                                      onClick={() => openDeleteModal(book)}
                                      disabled={loading.books}
                                    >
                                      <FaTrash />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedBook(null);
        }}
        onConfirm={(bookName, amount, category) =>
          selectedBook
            ? handleEditBook(bookName, amount, category)
            : handleAddBook(bookName, amount, category)
        }
        book={selectedBook}
        categories={categories}
      />

      <DeleteBookModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedBook(null);
        }}
        onConfirm={handleDeleteBook}
        book={selectedBook}
      />

      <ConfirmEditModal
        isOpen={isConfirmEditModalOpen}
        onClose={() => {
          setIsConfirmEditModalOpen(false);
          setSelectedBook(null);
          setNewBook(null);
        }}
        onConfirm={confirmEditBook}
        currentBook={selectedBook}
        newBook={newBook}
      />

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <style>
        {`
            .book-master-container {
              background-color: #fff;
            }

            .custom-breadcrumb {
              padding: 0.5rem 1rem;
            }

            .custom-breadcrumb a {
              color: #0B3D7B;
              text-decoration: none;
            }

            .custom-breadcrumb .separator {
              margin: 0 0.5rem;
              color: #6c757d;
            }

            .custom-breadcrumb .current {
              color: #212529;
            }

            .form-card {
              background-color: #fff;
              border: 1px solid #dee2e6;
              border-radius: 0.25rem;
            }

            .header {
              border-bottom: 1px solid #dee2e6;
            }

            .custom-search {
              max-width: 300px;
            }

            .table-responsive {
              margin-bottom: 0;
            }

            .table th {
              font-weight: 500;
            }

            .table td {
              vertical-align: middle;
            }

            .action-button {
              width: 30px;
              height: 30px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              border-radius: 4px;
              padding: 0;
              color: white;
            }

            .edit-button {
              background-color: #0B3D7B;
            }

            .edit-button:hover {
              background-color: #092a54;
              color: white;
            }

            .delete-button {
              background-color: #dc3545;
            }

            .delete-button:hover {
              background-color: #bb2d3b;
              color: white;
            }

            .modal-overlay {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background-color: rgba(0, 0, 0, 0.5);
              display: flex;
              justify-content: center;
              align-items: center;
              z-index: 1100;
            }

            .modal-content {
              background: white;
              padding: 1.5rem;
              border-radius: 12px;
              width: 90%;
              max-width: 600px;
              max-height: 85vh;
              overflow-y: auto;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }

            .modal-title {
              font-size: 1.5rem;
              font-weight: 600;
              margin-bottom: 1.5rem;
              color: #0B3D7B;
              text-align: center;
            }

            .modal-body {
              margin-bottom: 1.5rem;
            }

            .modal-footer {
              display: flex;
              justify-content: flex-end;
              gap: 1rem;
              padding-top: 1rem;
              border-top: 1px solid #e9ecef;
            }

            .modal-button {
              padding: 0.5rem 1.5rem;
              border: none;
              border-radius: 6px;
              font-weight: 500;
              transition: background-color 0.2s;
            }

            .modal-button.confirm {
              background-color: #0B3D7B;
              color: white;
            }

            .modal-button.confirm:hover {
              background-color: #092a54;
            }

            .modal-button.delete {
              background-color: #dc3545;
              color: white;
            }

            .modal-button.delete:hover {
              background-color: #bb2d3b;
            }

            .modal-button.cancel {
              background-color: #6c757d;
              color: white;
            }

            .modal-button.cancel:hover {
              background-color: #5a6268;
            }

            .custom-input {
              width: 100%;
              padding: 0.75rem;
              border: 1px solid #ced4da;
              border-radius: 6px;
              font-size: 0.9rem;
            }

            .custom-input:focus {
              border-color: #0B3D7B;
              box-shadow: 0 0 0 0.2rem rgba(11, 61, 123, 0.25);
            }

            .form-label {
              font-size: 0.9rem;
              color: #333;
            }

            .Toastify__toast-container {
              z-index: 9999;
            }

            .Toastify__toast {
              background-color: #0B3D7B;
              color: white;
              border-radius: 6px;
            }

            .Toastify__toast--success {
              background-color: #0B3D7B;
            }

            .Toastify__toast--error {
              background-color: #dc3545;
            }

            .Toastify__progress-bar {
              background-color: rgba(255, 255, 255, 0.7);
            }
          `}
      </style>
    </MainContentPage>
  );
};

export default BookMaster;
