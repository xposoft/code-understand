"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import MainContentPage from "../../components/MainContent/MainContentPage"
import { Form, Button, Row, Col, Container, Table, Modal } from "react-bootstrap"
import { FaEdit, FaTrash, FaEye, FaSearch } from "react-icons/fa"
import axios from "axios"
import { useAuthContext } from "../../Context/AuthContext"
import { ToastContainer, toast } from "react-toastify"
import { ENDPOINTS } from "../../SpringBoot/config"
import "react-toastify/dist/ReactToastify.css"

const ItemBookMaster = () => {
  const { user, currentAcademicYear } = useAuthContext()
  const location = useLocation()
  const [items, setItems] = useState({ items: [], searchTerm: "" })
  const [nextItemCode, setNextItemCode] = useState("ITEM-1")
  const [showModal, setShowModal] = useState(false)
  const [modalData, setModalData] = useState({
    action: "",
    data: null,
    itemCode: "",
    itemName: "",
    purchaseRate: "",
    group: "",
    unit: "",
    gstType: ""
  })
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showConfirmEditModal, setShowConfirmEditModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const ITEMS_URL = `${ENDPOINTS.store}/items`

  const fetchItems = async () => {
    if (!user?.uid || !currentAcademicYear) return

    try {
      const res = await axios.get(ITEMS_URL, {
        params: { schoolId: user.uid, year: currentAcademicYear },
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      })
      const itemsData = res.data || []
      setItems((prev) => ({ ...prev, items: itemsData }))
      generateNextItemCode(itemsData)
    } catch (err) {
      console.error("Error fetching items:", err)
      toast.error("Failed to fetch items")
    }
  }

  const generateNextItemCode = (itemsData) => {
    if (!itemsData || itemsData.length === 0) {
      setNextItemCode("ITEM-1")
      return
    }
    const itemNumbers = itemsData.map((item) => {
      const match = item.itemCode.match(/ITEM-(\d+)/)
      return match ? Number.parseInt(match[1], 10) : 0
    })
    const nextNumber = Math.max(...itemNumbers) + 1
    setNextItemCode(`ITEM-${nextNumber}`)
  }

  useEffect(() => {
    if (user?.uid && currentAcademicYear) {
      fetchItems()
    }
  }, [user?.uid, currentAcademicYear])

  const handleAdd = async () => {
    const { itemCode, itemName, purchaseRate, group, unit, gstType } = modalData
    if (!itemName.trim()) {
      toast.error("Item Name is required")
      return
    }

    try {
      await axios.post(ITEMS_URL, {
        itemCode,
        itemName,
        purchaseRate,
        group,
        unit,
        gstType,
        academicYear: currentAcademicYear
      }, {
        params: { schoolId: user.uid, year: currentAcademicYear },
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      })
      toast.success("Item added successfully")
      setShowModal(false)
      fetchItems()
    } catch (err) {
      console.error("Error adding item:", err)
      toast.error("Failed to add item")
    }
  }

  const handleEdit = async () => {
    const { data, itemName, purchaseRate, group, unit, gstType } = modalData
    if (!itemName.trim()) {
      toast.error("Item Name is required")
      return
    }

    setShowModal(false)
    setShowConfirmEditModal(true)
    setSelectedItem({
      ...data,
      itemName,
      purchaseRate,
      group,
      unit,
      gstType
    })
  }

  const handleConfirmEdit = async () => {
    try {
      await axios.put(`${ITEMS_URL}/${selectedItem.id}`, {
        itemCode: selectedItem.itemCode,
        itemName: selectedItem.itemName,
        purchaseRate: selectedItem.purchaseRate,
        group: selectedItem.group,
        unit: selectedItem.unit,
        gstType: selectedItem.gstType,
        academicYear: currentAcademicYear
      }, {
        params: { schoolId: user.uid, year: currentAcademicYear },
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      })
      toast.success("Item updated successfully")
      setShowConfirmEditModal(false)
      setSelectedItem(null)
      fetchItems()
    } catch (err) {
      console.error("Error updating item:", err)
      toast.error("Failed to update item")
    }
  }

  const handleDelete = async () => {
    try {
      await axios.delete(`${ITEMS_URL}/${selectedItem.id}`, {
        params: { schoolId: user.uid, year: currentAcademicYear },
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      })
      toast.success("Item deleted successfully")
      setShowDeleteModal(false)
      setSelectedItem(null)
      fetchItems()
    } catch (err) {
      console.error("Error deleting item:", err)
      toast.error("Failed to delete item")
    }
  }

  const openModal = (action, data = null) => {
    let initialData = {
      itemCode: nextItemCode,
      itemName: "",
      purchaseRate: "",
      group: "",
      unit: "",
      gstType: ""
    }
    if (action === "edit" && data) {
      initialData = {
        itemCode: data.itemCode || "",
        itemName: data.itemName || "",
        purchaseRate: data.purchaseRate || "",
        group: data.group || "",
        unit: data.unit || "",
        gstType: data.gstType || ""
      }
    }
    setModalData({ action, data, ...initialData })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setModalData({
      action: "",
      data: null,
      itemCode: "",
      itemName: "",
      purchaseRate: "",
      group: "",
      unit: "",
      gstType: ""
    })
  }

  const filteredItems = items.items.filter(
    (item) =>
      item.itemCode.toLowerCase().includes(items.searchTerm.toLowerCase()) ||
      item.itemName.toLowerCase().includes(items.searchTerm.toLowerCase())
  )

  return (
    <MainContentPage>
      <Container fluid className="px-0 px-lg-0">
        <nav className="custom-breadcrumb py-1 py-lg-3">
          <Link to="/home">Home</Link>
          <span className="separator">&gt;</span>
          <span>Store</span>
          <span className="separator">&gt;</span>
          <span className="current col-12">Item / Book Master</span>
        </nav>
        <Row>
          <Col xs={12}>
            <div className="item-book-container">
              <div className="form-card mt-3">
                <div className="header p-3 d-flex justify-content-between align-items-center">
                  <h2 className="m-0 d-none d-lg-block text-light">Item / Book Master</h2>
                  <h6 className="m-0 d-lg-none text-light">Item / Book Master</h6>
                  <Button onClick={() => openModal("add")} className="btn btn-light text-dark">
                    + Add Item
                  </Button>
                </div>
                <div className="content-wrapper p-4">
                  <Form.Group className="mb-3">
                    <Form.Control
                      type="text"
                      placeholder="Search by Item Code or Name"
                      value={items.searchTerm}
                      onChange={(e) => setItems((prev) => ({ ...prev, searchTerm: e.target.value }))}
                      className="custom-search"
                    />
                  </Form.Group>
                  <div className="table-responsive">
                    <Table bordered hover>
                      <thead style={{ backgroundColor: "#0B3D7B", color: "white" }}>
                        <tr>
                          <th>Item Code</th>
                          <th>Item Name</th>
                          <th>Purchase Rate</th>
                          <th>Group</th>
                          <th>Unit</th>
                          <th>GST Type</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredItems.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="text-center text-muted">
                              No items found
                            </td>
                          </tr>
                        ) : (
                          filteredItems.map((item) => (
                            <tr key={item.id}>
                              <td>{item.itemCode}</td>
                              <td>{item.itemName}</td>
                              <td>{item.purchaseRate || "N/A"}</td>
                              <td>{item.group || "N/A"}</td>
                              <td>{item.unit || "N/A"}</td>
                              <td>{item.gstType || "N/A"}</td>
                              <td>
                                <Button
                                  variant="link"
                                  className="action-button view-button me-2"
                                  onClick={() => setShowViewModal(true) || setSelectedItem(item)}
                                >
                                  <FaEye />
                                </Button>
                                <Button
                                  variant="link"
                                  className="action-button edit-button me-2"
                                  onClick={() => openModal("edit", item)}
                                >
                                  <FaEdit />
                                </Button>
                                <Button
                                  variant="link"
                                  className="action-button delete-button"
                                  onClick={() => setShowDeleteModal(true) || setSelectedItem(item)}
                                >
                                  <FaTrash />
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalData.action === "add" ? "Add" : "Edit"} Item / Book
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Item Code</Form.Label>
            <Form.Control
              type="text"
              value={modalData.itemCode}
              readOnly
              className="custom-input bg-light"
            />
            <Form.Text className="text-muted">Item code is auto-generated</Form.Text>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Item Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Item Name"
              value={modalData.itemName}
              onChange={(e) => setModalData({ ...modalData, itemName: e.target.value })}
              className="custom-input"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Purchase Rate</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter Purchase Rate"
              value={modalData.purchaseRate}
              onChange={(e) => setModalData({ ...modalData, purchaseRate: e.target.value })}
              className="custom-input"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Group</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Group"
              value={modalData.group}
              onChange={(e) => setModalData({ ...modalData, group: e.target.value })}
              className="custom-input"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Unit</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Unit"
              value={modalData.unit}
              onChange={(e) => setModalData({ ...modalData, unit: e.target.value })}
              className="custom-input"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>GST Type</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter GST Type"
              value={modalData.gstType}
              onChange={(e) => setModalData({ ...modalData, gstType: e.target.value })}
              className="custom-input"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={modalData.action === "add" ? handleAdd : handleEdit} style={{ backgroundColor: "#0B3D7B" }}>
            {modalData.action === "add" ? "Add" : "Update"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Item / Book Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <>
              <div className="item-detail"><strong>Item Code:</strong> {selectedItem.itemCode}</div>
              <div className="item-detail"><strong>Item Name:</strong> {selectedItem.itemName}</div>
              <div className="item-detail"><strong>Purchase Rate:</strong> {selectedItem.purchaseRate || "N/A"}</div>
              <div className="item-detail"><strong>Group:</strong> {selectedItem.group || "N/A"}</div>
              <div className="item-detail"><strong>Unit:</strong> {selectedItem.unit || "N/A"}</div>
              <div className="item-detail"><strong>GST Type:</strong> {selectedItem.gstType || "N/A"}</div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Item / Book</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <p>Are you sure you want to delete this item?</p>
          <p className="fw-bold">{selectedItem?.itemName}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showConfirmEditModal} onHide={() => setShowConfirmEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Edit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to edit this item? This may affect related data.</p>
          <p><strong>Item Code:</strong> {selectedItem?.itemCode}</p>
          <p><strong>Current Item Name:</strong> {selectedItem?.data?.itemName || selectedItem?.itemName}</p>
          <p><strong>New Item Name:</strong> {selectedItem?.itemName}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirmEdit} style={{ backgroundColor: "#0B3D7B" }}>
            Confirm Edit
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer />

      <style>
        {`
          .item-book-container {
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
            background-color: #0B3D7B;
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

          .view-button {
            background-color: #28a745;
          }

          .view-button:hover {
            background-color: #218838;
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

          .item-detail {
            margin-bottom: 0.5rem;
            padding: 0.5rem;
            border-bottom: 1px solid #eee;
          }

          .custom-input {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #ced4da;
            border-radius: 4px;
          }

          .Toastify__toast--success {
            background-color: #0B3D7B;
          }

          .Toastify__toast--error {
            background-color: #dc3545;
          }
        `}
      </style>
    </MainContentPage>
  )
}

export default ItemBookMaster