"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import MainContentPage from "../../components/MainContent/MainContentPage"
import { Form, Button, Row, Col, Container, Table, Spinner } from "react-bootstrap"
import { FaEdit, FaTrash } from "react-icons/fa"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { useAuthContext } from "../../Context/AuthContext"
import { ENDPOINTS } from "../../SpringBoot/config"
import axios from "axios"

// Add Book Setup Class Modal Component
const AddBookSetupClassModal = ({ isOpen, onClose, onConfirm, standards, books, existingSetups }) => {
  const [standard, setStandard] = useState("")
  const [selectedBooks, setSelectedBooks] = useState([])

  if (!isOpen) return null

  const handleAddBook = () => {
    setSelectedBooks([...selectedBooks, { bookId: "", quantity: "", amount: "" }])
  }

  const handleBookChange = (index, field, value) => {
    const updatedBooks = [...selectedBooks]
    if (field === "quantity") {
      value = Math.max(0, Number.parseInt(value) || 0)
    } else if (field === "amount") {
      value = Math.max(0, Number.parseFloat(value) || 0).toFixed(2)
    }
    updatedBooks[index][field] = value
    setSelectedBooks(updatedBooks)
  }

  const handleRemoveBook = (index) => {
    setSelectedBooks(selectedBooks.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    if (!standard) {
      toast.error("Please select a standard")
      return
    }
    if (selectedBooks.length === 0) {
      toast.error("Please add at least one book")
      return
    }
    if (selectedBooks.some((book) => !book.bookId || book.quantity <= 0 || book.amount <= 0)) {
      toast.error("All books must have a selected book, positive quantity, and positive amount")
      return
    }
    if (existingSetups.some((setup) => setup.standard === standard)) {
      toast.error("A book setup class for this standard already exists. Please edit the existing setup.")
      return
    }
    const bookIds = selectedBooks.map((book) => book.bookId)
    if (new Set(bookIds).size !== bookIds.length) {
      toast.error("Duplicate books are not allowed. Please remove duplicates.")
      return
    }

    const totalQuantity = selectedBooks.reduce((sum, book) => sum + Number(book.quantity), 0)
    console.log("Submitting book setup class:", { standard, books: selectedBooks, totalQuantity })
    onConfirm({ standard, books: selectedBooks, totalQuantity })
    setStandard("")
    setSelectedBooks([])
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Add Book Setup Class</h2>
        <div className="modal-body">
          <Row>
            <Col xs={12}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Select Standard</Form.Label>
                <Form.Select
                  value={standard}
                  onChange={(e) => setStandard(e.target.value)}
                  className="custom-input"
                >
                  <option value="">Select Standard</option>
                  {standards
                    .filter((std) => !existingSetups.some((setup) => setup.standard === std.standard))
                    .map((std) => (
                      <option key={std.id} value={std.standard}>
                        {std.standard}
                      </option>
                    ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col xs={12} md={4}>
              <Form.Label className="fw-bold">Book</Form.Label>
            </Col>
            <Col xs={6} md={3}>
              <Form.Label className="fw-bold">Quantity</Form.Label>
            </Col>
            <Col xs={6} md={3}>
              <Form.Label className="fw-bold">Amount</Form.Label>
            </Col>
            <Col xs={12} md={2}></Col>
          </Row>
          {selectedBooks.map((book, index) => (
            <Row key={index} className="mb-3 align-items-center">
              <Col xs={12} md={4}>
                <Form.Select
                  value={book.bookId}
                  onChange={(e) => handleBookChange(index, "bookId", e.target.value)}
                  className="custom-input"
                >
                  <option value="">Select Book</option>
                  {books
                    .filter((b) => !selectedBooks.some((sb) => sb.bookId === b.id && sb !== book))
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bookName} ({b.category || "No Category"})
                      </option>
                    ))}
                </Form.Select>
              </Col>
              <Col xs={6} md={3}>
                <Form.Control
                  type="number"
                  min="0"
                  placeholder="Quantity"
                  value={book.quantity}
                  onChange={(e) => handleBookChange(index, "quantity", e.target.value)}
                  className="custom-input"
                />
              </Col>
              <Col xs={6} md={3}>
                <Form.Control
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Amount"
                  value={book.amount}
                  onChange={(e) => handleBookChange(index, "amount", e.target.value)}
                  className="custom-input"
                />
              </Col>
              <Col xs={12} md={2}>
                <Button
                  variant="danger"
                  onClick={() => handleRemoveBook(index)}
                  className="w-100 custom-input"
                >
                  Remove
                </Button>
              </Col>
            </Row>
          ))}
          <Button variant="secondary" onClick={handleAddBook} className="mb-3">
            Add Book
          </Button>
        </div>
        <div className="modal-footer">
          <Button className="modal-button cancel" onClick={onClose}>
            Cancel
          </Button>
          <Button className="modal-button confirm" onClick={handleSubmit}>
            Add
          </Button>
        </div>
      </div>
    </div>
  )
}

// Edit Book Setup Class Modal Component
const EditBookSetupClassModal = ({ isOpen, onClose, onConfirm, setup, standards, books }) => {
  const [standard, setStandard] = useState(setup?.standard || "")
  const [selectedBooks, setSelectedBooks] = useState([])

  useEffect(() => {
    if (setup) {
      setStandard(setup.standard)
      // Group by standard and convert to books array
      setSelectedBooks([
        {
          bookId: String(setup.bookId),
          quantity: setup.quantity,
          amount: setup.amount
        }
      ])
    }
  }, [setup])

  if (!isOpen) return null

  const handleAddBook = () => {
    setSelectedBooks([...selectedBooks, { bookId: "", quantity: "", amount: "" }])
  }

  const handleBookChange = (index, field, value) => {
    const updatedBooks = [...selectedBooks]
    if (field === "quantity") {
      value = Math.max(0, Number.parseInt(value) || 0)
    } else if (field === "amount") {
      value = Math.max(0, Number.parseFloat(value) || 0).toFixed(2)
    }
    updatedBooks[index][field] = value
    setSelectedBooks(updatedBooks)
  }

  const handleRemoveBook = (index) => {
    setSelectedBooks(selectedBooks.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    if (selectedBooks.length === 0) {
      toast.error("Please add at least one book")
      return
    }
    if (selectedBooks.some((book) => !book.bookId || book.quantity <= 0 || book.amount <= 0)) {
      toast.error("All books must have a selected book, positive quantity, and positive amount")
      return
    }
    const bookIds = selectedBooks.map((book) => book.bookId)
    if (new Set(bookIds).size !== bookIds.length) {
      toast.error("Duplicate books are not allowed. Please remove duplicates.")
      return
    }

    const totalQuantity = selectedBooks.reduce((sum, book) => sum + Number(book.quantity), 0)
    console.log("Submitting updated book setup class:", { id: setup.id, standard, books: selectedBooks, totalQuantity })
    onConfirm({ id: setup.id, standard, books: selectedBooks, totalQuantity })
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Edit Book Setup Class</h2>
        <div className="modal-body">
          <Row>
            <Col xs={12}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Standard</Form.Label>
                <Form.Control
                  type="text"
                  value={standard}
                  readOnly
                  className="custom-input"
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col xs={12} md={4}>
              <Form.Label className="fw-bold">Book</Form.Label>
            </Col>
            <Col xs={6} md={3}>
              <Form.Label className="fw-bold">Quantity</Form.Label>
            </Col>
            <Col xs={6} md={3}>
              <Form.Label className="fw-bold">Amount</Form.Label>
            </Col>
            <Col xs={12} md={2}></Col>
          </Row>
          {selectedBooks.map((book, index) => (
            <Row key={index} className="mb-3 align-items-center">
              <Col xs={12} md={4}>
                <Form.Select
                  value={book.bookId}
                  onChange={(e) => handleBookChange(index, "bookId", e.target.value)}
                  className="custom-input"
                >
                  <option value="">Select Book</option>
                  {books
                    .filter((b) => !selectedBooks.some((sb) => sb.bookId === b.id && sb !== book))
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bookName} ({b.category || "No Category"})
                      </option>
                    ))}
                </Form.Select>
              </Col>
              <Col xs={6} md={3}>
                <Form.Control
                  type="number"
                  min="0"
                  placeholder="Quantity"
                  value={book.quantity}
                  onChange={(e) => handleBookChange(index, "quantity", e.target.value)}
                  className="custom-input"
                />
              </Col>
              <Col xs={6} md={3}>
                <Form.Control
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Amount"
                  value={book.amount}
                  onChange={(e) => handleBookChange(index, "amount", e.target.value)}
                  className="custom-input"
                />
              </Col>
              <Col xs={12} md={2}>
                <Button
                  variant="danger"
                  onClick={() => handleRemoveBook(index)}
                  className="w-100 custom-input"
                >
                  Remove
                </Button>
              </Col>
            </Row>
          ))}
          <Button variant="secondary" onClick={handleAddBook} className="mb-3">
            Add Book
          </Button>
        </div>
        <div className="modal-footer">
          <Button className="modal-button cancel" onClick={onClose}>
            Cancel
          </Button>
          <Button className="modal-button confirm" onClick={handleSubmit}>
            Update
          </Button>
        </div>
      </div>
    </div>
  )
}

// Delete Book Setup Class Modal Component
const DeleteBookSetupClassModal = ({ isOpen, onClose, onConfirm, setup }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Delete Book Setup Class</h2>
        <div className="modal-body text-center">
          <p>Are you sure you want to delete this book setup class?</p>
          <p className="fw-bold">{setup?.standard}</p>
        </div>
        <div className="modal-footer">
          <Button className="modal-button cancel" onClick={onClose}>
            Cancel
          </Button>
          <Button className="modal-button delete" onClick={() => onConfirm(setup.id)}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}

const BookSetupClassWise = () => {
  const { user, schoolId, currentAcademicYear } = useAuthContext()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedSetup, setSelectedSetup] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [standards, setStandards] = useState([])
  const [books, setBooks] = useState([])
  const [bookSetupClasses, setBookSetupClasses] = useState([])
  const [selectedStandard, setSelectedStandard] = useState("")
  const [loading, setLoading] = useState({ standards: false, books: false, setups: false })
  const BOOKS_URL = `${ENDPOINTS.store}/books`
  const COURSES_URL = `${ENDPOINTS.administration}/courses`
  const BOOK_SETUP_CLASSES_URL = `${ENDPOINTS.store}/book-setup-classes`

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    "X-School-ID": schoolId,
    "X-Academic-Year": currentAcademicYear,
  })

  const fetchStandards = async () => {
    if (!schoolId || !currentAcademicYear) return
    try {
      setLoading((prev) => ({ ...prev, standards: true }))
      const res = await axios.get(COURSES_URL, {
        params: { schoolId, year: currentAcademicYear },
        headers: getAuthHeaders(),
      })
      console.log("Fetched standards:", res.data)
      setStandards(res.data || [])
    } catch (error) {
      console.error("Error fetching standards:", error)
      toast.error(`Failed to fetch standards: ${error.response?.data?.message || error.message}`)
    } finally {
      setLoading((prev) => ({ ...prev, standards: false }))
    }
  }

  const fetchBooks = async () => {
    if (!schoolId || !currentAcademicYear) return
    try {
      setLoading((prev) => ({ ...prev, books: true }))
      const res = await axios.get(BOOKS_URL, {
        params: { schoolId, year: currentAcademicYear },
        headers: getAuthHeaders(),
      })
      console.log("Fetched books:", res.data)
      setBooks(res.data || [])
    } catch (error) {
      console.error("Error fetching books:", error)
      toast.error(`Failed to fetch books: ${error.response?.data?.message || error.message}`)
    } finally {
      setLoading((prev) => ({ ...prev, books: false }))
    }
  }

  const fetchBookSetupClasses = async () => {
    if (!schoolId || !currentAcademicYear) return
    try {
      setLoading((prev) => ({ ...prev, setups: true }))
      const res = await axios.get(BOOK_SETUP_CLASSES_URL, {
        params: { schoolId, year: currentAcademicYear },
        headers: getAuthHeaders(),
      })
      console.log("Fetched book setup classes:", res.data)
      setBookSetupClasses(res.data || [])
    } catch (error) {
      console.error("Error fetching book setup classes:", error)
      toast.error(`Failed to fetch book setup classes: ${error.response?.data?.message || error.message}`)
    } finally {
      setLoading((prev) => ({ ...prev, setups: false }))
    }
  }

  useEffect(() => {
    if (user && schoolId && currentAcademicYear) {
      console.log("Fetching data for schoolId:", schoolId, "academicYear:", currentAcademicYear)
      fetchStandards()
      fetchBooks()
      fetchBookSetupClasses()
    }
  }, [user, schoolId, currentAcademicYear])

  const handleAddBookSetupClass = async (newSetup) => {
    if (!schoolId || !currentAcademicYear) {
      toast.error("School or academic year not initialized")
      return
    }
    try {
      setLoading((prev) => ({ ...prev, setups: true }))
      console.log("Sending POST request:", { standard: newSetup.standard, books: newSetup.books, totalQuantity: newSetup.totalQuantity, academicYear: currentAcademicYear })
      const response = await axios.post(
        BOOK_SETUP_CLASSES_URL,
        { standard: newSetup.standard, books: newSetup.books, totalQuantity: newSetup.totalQuantity, academicYear: currentAcademicYear },
        { params: { schoolId, year: currentAcademicYear }, headers: getAuthHeaders() }
      )
      console.log("POST response:", response.data)
      setIsAddModalOpen(false)
      toast.success("Book setup class added successfully!", {
        style: { background: "#0B3D7B", color: "white" },
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
      })
      await fetchBookSetupClasses()
    } catch (error) {
      console.error("Error adding book setup class:", error)
      toast.error(`Failed to add book setup class: ${error.response?.data?.message || error.message}`)
    } finally {
      setLoading((prev) => ({ ...prev, setups: false }))
    }
  }

  const handleEditBookSetupClass = async (updatedSetup) => {
    if (!schoolId || !currentAcademicYear) {
      toast.error("School or academic year not initialized")
      return
    }
    try {
      setLoading((prev) => ({ ...prev, setups: true }))
      console.log("Sending PUT request:", { id: updatedSetup.id, standard: updatedSetup.standard, books: updatedSetup.books, totalQuantity: updatedSetup.totalQuantity })
      await axios.put(
        `${BOOK_SETUP_CLASSES_URL}/${updatedSetup.id}`,
        { standard: updatedSetup.standard, books: updatedSetup.books, totalQuantity: updatedSetup.totalQuantity, academicYear: currentAcademicYear },
        { params: { schoolId, year: currentAcademicYear }, headers: getAuthHeaders() }
      )
      setIsEditModalOpen(false)
      setSelectedSetup(null)
      toast.success("Book setup class updated successfully!", {
        style: { background: "#0B3D7B", color: "white" },
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
      })
      await fetchBookSetupClasses()
    } catch (error) {
      console.error("Error updating book setup class:", error)
      toast.error(`Failed to update book setup class: ${error.response?.data?.message || error.message}`)
    } finally {
      setLoading((prev) => ({ ...prev, setups: false }))
    }
  }

  const handleDeleteBookSetupClass = async (setupId) => {
    if (!schoolId || !currentAcademicYear) {
      toast.error("School or academic year not initialized")
      return
    }
    try {
      setLoading((prev) => ({ ...prev, setups: true }))
      await axios.delete(`${BOOK_SETUP_CLASSES_URL}/${setupId}`, {
        params: { schoolId },
        headers: getAuthHeaders(),
      })
      setIsDeleteModalOpen(false)
      setSelectedSetup(null)
      toast.success("Book setup class deleted successfully!", {
        style: { background: "#0B3D7B", color: "white" },
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
      })
      await fetchBookSetupClasses()
    } catch (error) {
      console.error("Error deleting book setup class:", error)
      toast.error(`Failed to delete book setup class: ${error.response?.data?.message || error.message}`)
    } finally {
      setLoading((prev) => ({ ...prev, setups: false }))
    }
  }

  const openEditModal = (setup) => {
    setSelectedSetup(setup)
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (setup) => {
    setSelectedSetup(setup)
    setIsDeleteModalOpen(true)
  }

  const calculateTotalAmount = (books) => {
    return books
      .reduce((total, book) => total + (Number(book.amount) || 0) * (Number(book.quantity) || 0), 0)
      .toFixed(2)
  }

  // Group book setup classes by standard for display
  const groupedBookSetupClasses = bookSetupClasses.reduce((acc, setup) => {
    if (!acc[setup.standard]) {
      acc[setup.standard] = {
        standard: setup.standard,
        books: [],
        totalQuantity: setup.totalQuantity,
        ids: []
      }
    }
    acc[setup.standard].books.push({
      bookId: setup.bookId,
      quantity: setup.quantity,
      amount: setup.amount
    })
    acc[setup.standard].ids.push(setup.id)
    return acc
  }, {})

  const filteredBookSetupClasses = Object.values(groupedBookSetupClasses).filter(
    (setup) =>
      (selectedStandard === "" || setup.standard === selectedStandard) &&
      (setup.standard.toLowerCase().includes(searchTerm.toLowerCase()) ||
        setup.books.some((book) =>
          books
            .find((b) => String(b.id) === String(book.bookId))
            ?.bookName.toLowerCase()
            .includes(searchTerm.toLowerCase())
        ))
  )

  return (
    <MainContentPage>
      <Container fluid className="px-0 px-lg-0">
        <nav className="custom-breadcrumb py-1 py-lg-3">
          <Link to="/home">Home</Link>
          <span className="separator">&gt;</span>
          <span>Store</span>
          <span className="separator">&gt;</span>
          <span className="current">Book Setup Class Wise</span>
        </nav>
        <Row>
          <Col xs={12}>
            <div className="book-setup-container">
              <div className="form-card mt-3">
                <div className="header p-3 d-flex justify-content-between align-items-center" style={{ backgroundColor: "#0B3D7B", color: "white" }}>
                  <h2 className="m-0 d-none d-lg-block">Book Setup Class Wise</h2>
                  <h6 className="m-0 d-lg-none">Book Setup Class Wise</h6>
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="btn btn-light text-dark"
                    disabled={loading.setups || !schoolId || !currentAcademicYear}
                  >
                    + Add Book Setup Class
                  </Button>
                </div>
                <div className="content-wrapper p-4">
                  {loading.setups ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" role="status" style={{ color: "#0B3D7B" }}>
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                      <p className="mt-2">Loading book setup classes...</p>
                    </div>
                  ) : !schoolId || !currentAcademicYear ? (
                    <div className="alert alert-warning">Please select an academic year and school to manage book setup classes.</div>
                  ) : (
                    <>
                      <Row className="mb-3">
                        <Col xs={12} md={6} lg={4}>
                          <Form.Group>
                            <Form.Label className="fw-bold">Select Standard</Form.Label>
                            <Form.Select
                              value={selectedStandard}
                              onChange={(e) => setSelectedStandard(e.target.value)}
                              className="custom-input"
                              disabled={loading.standards}
                            >
                              <option value="">All Standards</option>
                              {standards.map((std) => (
                                <option key={std.id} value={std.standard}>
                                  {std.standard}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col xs={12} md={6} lg={8}>
                          <Form.Group>
                            <Form.Label className="fw-bold">Search</Form.Label>
                            <div className="d-flex">
                              <Form.Control
                                type="text"
                                placeholder="Search by Standard or Book Name"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="custom-input me-2"
                                disabled={loading.setups}
                              />
                              <Button
                                variant="danger"
                                onClick={() => setSearchTerm("")}
                                disabled={loading.setups || !searchTerm}
                              >
                                Reset
                              </Button>
                            </div>
                          </Form.Group>
                        </Col>
                      </Row>
                      <div className="table-responsive">
                        {filteredBookSetupClasses.length === 0 ? (
                          <div className="alert alert-info">No book setup classes found. Add a new book setup class to get started.</div>
                        ) : (
                          <Table bordered hover>
                            <thead style={{ backgroundColor: "#0B3D7B", color: "white" }}>
                              <tr>
                                <th>Standard</th>
                                <th>Books</th>
                                <th>Total Quantity</th>
                                <th>Total Amount</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredBookSetupClasses.map((setup) => (
                                <tr key={setup.standard}>
                                  <td>{setup.standard}</td>
                                  <td>
                                    {setup.books.map((book) => (
                                      <div key={book.bookId}>
                                        {books.find((b) => String(b.id) === String(book.bookId))?.bookName || "Unknown Book"}: {book.quantity} (Rs. {book.amount})
                                      </div>
                                    ))}
                                  </td>
                                  <td>{setup.totalQuantity}</td>
                                  <td>Rs. {calculateTotalAmount(setup.books)}</td>
                                  <td>
                                    <Button
                                      variant="link"
                                      className="action-button edit-button me-2"
                                      onClick={() => openEditModal({ id: setup.ids[0], standard: setup.standard, bookId: setup.books[0].bookId, quantity: setup.books[0].quantity, amount: setup.books[0].amount })}
                                      disabled={loading.setups}
                                    >
                                      <FaEdit />
                                    </Button>
                                    <Button
                                      variant="link"
                                      className="action-button delete-button"
                                      onClick={() => openDeleteModal({ id: setup.ids[0], standard: setup.standard })}
                                      disabled={loading.setups}
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

      <AddBookSetupClassModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onConfirm={handleAddBookSetupClass}
        standards={standards}
        books={books}
        existingSetups={bookSetupClasses}
      />
      <EditBookSetupClassModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedSetup(null)
        }}
        onConfirm={handleEditBookSetupClass}
        setup={selectedSetup}
        standards={standards}
        books={books}
      />
      <DeleteBookSetupClassModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedSetup(null)
        }}
        onConfirm={handleDeleteBookSetupClass}
        setup={selectedSetup}
      />

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <style>
        {`
          .book-setup-container {
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
            max-width: 700px;
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
  )
}

export default BookSetupClassWise