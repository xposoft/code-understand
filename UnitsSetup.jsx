// units-setup.jsx
"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import MainContentPage from "../../components/MainContent/MainContentPage"
import { Form, Button, Row, Col, Container, Table } from "react-bootstrap"
import { FaEdit, FaTrash } from "react-icons/fa"

import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import * as XLSX from "xlsx"

// Add Unit Modal Component
const AddUnitModal = ({ isOpen, onClose, onConfirm }) => {
  const [unitName, setUnitName] = useState("")

  if (!isOpen) return null

  const handleSubmit = () => {
    onConfirm(unitName)
    setUnitName("")
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Add Unit</h2>
        <div className="modal-body">
          <Form.Control
            type="text"
            placeholder="Enter Unit Name (e.g., kg, liter, piece)"
            value={unitName}
            onChange={(e) => setUnitName(e.target.value)}
            className="custom-input"
          />
        </div>
        <div className="modal-buttons">
          <Button className="modal-button confirm" onClick={handleSubmit}>
            Add
          </Button>
          <Button className="modal-button cancel" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

// Edit Unit Modal Component
const EditUnitModal = ({ isOpen, onClose, onConfirm, unit }) => {
  const [unitName, setUnitName] = useState(unit?.unitName || "")

  useEffect(() => {
    if (unit) {
      setUnitName(unit.unitName)
    }
  }, [unit])

  if (!isOpen) return null

  const handleSubmit = () => {
    onConfirm(unit.id, unitName)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Edit Unit</h2>
        <div className="modal-body">
          <Form.Control
            type="text"
            placeholder="Enter Unit Name"
            value={unitName}
            onChange={(e) => setUnitName(e.target.value)}
            className="custom-input"
          />
        </div>
        <div className="modal-buttons">
          <Button className="modal-button confirm" onClick={handleSubmit}>
            Update
          </Button>
          <Button className="modal-button cancel" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

// Delete Unit Modal Component
const DeleteUnitModal = ({ isOpen, onClose, onConfirm, unit }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Delete Unit</h2>
        <div className="modal-body text-center">
          <p>Are you sure you want to delete this unit?</p>
          <p className="fw-bold">{unit?.unitName}</p>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button delete" onClick={() => onConfirm(unit.id)}>
            Delete
          </Button>
          <Button className="modal-button cancel" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

// Confirm Edit Modal Component
const ConfirmEditModal = ({ isOpen, onClose, onConfirm, currentName, newName }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Confirm Edit</h2>
        <div className="modal-body">
          <p>Are you sure you want to edit this unit? This may affect existing data.</p>
          <p>
            <strong>Current Name:</strong> {currentName}
          </p>
          <p>
            <strong>New Name:</strong> {newName}
          </p>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button confirm" onClick={onConfirm}>
            Confirm Edit
          </Button>
          <Button className="modal-button cancel" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

const UnitsSetup = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isConfirmEditModalOpen, setIsConfirmEditModalOpen] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState(null)
  const [newUnitName, setNewUnitName] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [units, setUnits] = useState([])
  const [storeId, setStoreId] = useState(null)

  // Reset state and fetch data when user changes
  useEffect(() => {
    const resetState = () => {
      setUnits([])
      setStoreId(null)
      setSearchTerm("")
      setSelectedUnit(null)
      setNewUnitName("")
      setIsAddModalOpen(false)
      setIsEditModalOpen(false)
      setIsDeleteModalOpen(false)
      setIsConfirmEditModalOpen(false)
    }

    resetState()

    const checkAuthAndFetchData = async () => {
      if (auth.currentUser) {
        console.log("User is authenticated:", auth.currentUser.uid)
        await fetchStoreId()
      } else {
        console.log("User is not authenticated")
        toast.error("Please log in to view and manage units.", {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        })
      }
    }

    checkAuthAndFetchData()

    return () => resetState()
  }, [auth.currentUser?.uid]) // Re-run on user change

  useEffect(() => {
    if (storeId && auth.currentUser) {
      fetchUnits()
    }
  }, [storeId])

  const fetchStoreId = async () => {
    if (!auth.currentUser) return

    try {
      const storeRef = collection(db, "Schools", auth.currentUser.uid, "Store")
      const q = query(storeRef, limit(1))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        const newStoreRef = await addDoc(storeRef, { createdAt: new Date() })
        setStoreId(newStoreRef.id)
        console.log("New Store ID created:", newStoreRef.id)
      } else {
        const storeId = querySnapshot.docs[0].id
        setStoreId(storeId)
        console.log("Existing Store ID fetched:", storeId)
      }
    } catch (error) {
      console.error("Error fetching/creating Store ID:", error)
      toast.error("Failed to initialize store data. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    }
  }

  const fetchUnits = async () => {
    if (!storeId || !auth.currentUser) return

    try {
      const unitsRef = collection(db, "Schools", auth.currentUser.uid, "Store", storeId, "UnitsSetup")
      const querySnapshot = await getDocs(unitsRef)
      const unitsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      console.log("Fetched units for user", auth.currentUser.uid, ":", unitsData)
      setUnits(unitsData) // Update state with fetched data
    } catch (error) {
      console.error("Error fetching units:", error)
      toast.error("Failed to fetch units. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      setUnits([]) // Reset on error
    }
  }

  const handleAddUnit = async (unitName) => {
    if (!storeId || !auth.currentUser) {
      toast.error("Store not initialized or user not logged in. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return
    }

    if (!unitName.trim()) {
      toast.error("Unit name cannot be empty.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return
    }

    const isDuplicate = units.some((unit) => unit.unitName.toLowerCase() === unitName.toLowerCase())
    if (isDuplicate) {
      toast.error("A unit with this name already exists. Please choose a different name.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return
    }

    try {
      const unitsRef = collection(db, "Schools", auth.currentUser.uid, "Store", storeId, "UnitsSetup")
      const docRef = await addDoc(unitsRef, { unitName })
      console.log("Unit added with ID:", docRef.id, "for user:", auth.currentUser.uid)

      // Immediately update UI
      const newUnit = { id: docRef.id, unitName }
      setUnits((prevUnits) => [...prevUnits, newUnit])

      setIsAddModalOpen(false)
      toast.success("Unit added successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: { background: "#0B3D7B", color: "white" },
      })

      // Fetch fresh data to ensure consistency
      await fetchUnits()
    } catch (error) {
      console.error("Error adding unit:", error)
      toast.error("Failed to add unit. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    }
  }

  const handleEditUnit = async (unitId, newUnitName) => {
    if (!storeId || !auth.currentUser) {
      toast.error("Store not initialized or user not logged in. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return
    }

    if (!newUnitName.trim()) {
      toast.error("Unit name cannot be empty.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return
    }

    const isDuplicate = units.some(
      (unit) => unit.id !== unitId && unit.unitName.toLowerCase() === newUnitName.toLowerCase(),
    )
    if (isDuplicate) {
      toast.error("A unit with this name already exists. Please choose a different name.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return
    }

    setIsEditModalOpen(false)
    setIsConfirmEditModalOpen(true)
    setNewUnitName(newUnitName)
  }

  const confirmEditUnit = async () => {
    if (!storeId || !auth.currentUser) {
      toast.error("Store not initialized or user not logged in. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return
    }

    try {
      const unitRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "Store",
        storeId,
        "UnitsSetup",
        selectedUnit.id,
      )
      await updateDoc(unitRef, { unitName: newUnitName })
      console.log("Unit updated:", selectedUnit.id, "for user:", auth.currentUser.uid)

      // Immediately update UI
      setUnits((prevUnits) =>
        prevUnits.map((unit) =>
          unit.id === selectedUnit.id ? { ...unit, unitName: newUnitName } : unit
        )
      )

      setIsConfirmEditModalOpen(false)
      setSelectedUnit(null)
      setNewUnitName("")
      toast.success("Unit updated successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: { background: "#0B3D7B", color: "white" },
      })

      // Fetch fresh data
      await fetchUnits()
    } catch (error) {
      console.error("Error updating unit:", error)
      toast.error("Failed to update unit. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    }
  }

  const handleDeleteUnit = async (unitId) => {
    if (!storeId || !auth.currentUser) {
      toast.error("Store not initialized or user not logged in. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return
    }

    try {
      const unitRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "Store",
        storeId,
        "UnitsSetup",
        unitId,
      )
      await deleteDoc(unitRef)
      console.log("Unit deleted:", unitId, "for user:", auth.currentUser.uid)

      // Immediately update UI
      setUnits((prevUnits) => prevUnits.filter((unit) => unit.id !== unitId))

      setIsDeleteModalOpen(false)
      setSelectedUnit(null)
      toast.success("Unit deleted successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })

      // Fetch fresh data
      await fetchUnits()
    } catch (error) {
      console.error("Error deleting unit:", error)
      toast.error("Failed to delete unit. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    }
  }

  const handleImport = async (event) => {
    if (!storeId || !auth.currentUser) {
      toast.error("Store not initialized or user not logged in. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return
    }

    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: "array" })
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(sheet)

      if (jsonData.length === 0) {
        toast.error("No data found in the imported file.")
        return
      }

      try {
        const unitsRef = collection(db, "Schools", auth.currentUser.uid, "Store", storeId, "UnitsSetup")
        const newUnits = []
        for (const row of jsonData) {
          const unitName = row["Unit Name"] || row["unitName"]
          if (unitName && unitName.trim()) {
            const isDuplicate = units.some((unit) => unit.unitName.toLowerCase() === unitName.toLowerCase())
            if (!isDuplicate) {
              const docRef = await addDoc(unitsRef, { unitName })
              newUnits.push({ id: docRef.id, unitName })
              console.log("Imported unit:", unitName, "for user:", auth.currentUser.uid)
            }
          }
        }

        // Update UI
        setUnits((prevUnits) => [...prevUnits, ...newUnits])

        toast.success("Units imported successfully!", {
          style: { background: "#0B3D7B", color: "white" },
        })

        // Fetch fresh data
        await fetchUnits()
      } catch (error) {
        console.error("Error importing units:", error)
        toast.error("Failed to import units. Please try again.")
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleExport = () => {
    if (!storeId || !auth.currentUser) {
      toast.error("Store not initialized or user not logged in. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return
    }

    if (units.length === 0) {
      toast.error("No data available to export.")
      return
    }

    const exportData = units.map((unit) => ({
      "Unit Name": unit.unitName,
    }))
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Units")
    XLSX.writeFile(workbook, `Units_Export_${auth.currentUser.uid}.xlsx`)
    toast.success("Units exported successfully!", {
      style: { background: "#0B3D7B", color: "white" },
    })
  }

  const openEditModal = (unit) => {
    setSelectedUnit(unit)
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (unit) => {
    setSelectedUnit(unit)
    setIsDeleteModalOpen(true)
  }

  const filteredUnits = units.filter((unit) =>
    unit.unitName && unit.unitName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <MainContentPage>
      <Container fluid className="px-0 px-lg-0">
        {/* Breadcrumb Navigation */}
        <nav className="custom-breadcrumb py-1 py-lg-3">
          <Link to="/home">Home</Link>
          <span className="separator"></span>
          <span>Store</span>
          <span className="separator"></span>
          <span className="current col-12">Units Setup</span>
        </nav>
        <Row>
          <Col xs={12}>
            <div className="units-setup-container">
              <div className="form-card mt-3">
                {/* Header */}
                <div className="header p-3 d-flex justify-content-between align-items-center" style={{ backgroundColor: "#0B3D7B", color: "white" }}>
                  <div>
                    <h2 className="m-0 d-none d-lg-block">Units Setup</h2>
                    <h6 className="m-0 d-lg-none">Units Setup</h6>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={handleImport}
                      style={{ display: "none" }}
                      id="import-file"
                    />
                    <Button
                      onClick={() => document.getElementById("import-file").click()}
                      className="btn btn-light text-dark"
                    >
                      Import
                    </Button>
                    <Button onClick={handleExport} className="btn btn-light text-dark">
                      Export
                    </Button>
                    <Button onClick={() => setIsAddModalOpen(true)} className="btn btn-light text-dark">
                      + Add Unit
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="content-wrapper p-4">
                  {/* Search Bar */}
                  <Form.Control
                    type="text"
                    placeholder="Search by Unit Name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="custom-search mb-3"
                  />

                  {/* Units Table */}
                  <div className="table-responsive">
                    <Table bordered hover>
                      <thead style={{ backgroundColor: "#0B3D7B", color: "white" }}>
                        <tr>
                          <th>Unit Name</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {units.length === 0 ? (
                          <tr>
                            <td colSpan="2" className="text-center">
                              No data available
                            </td>
                          </tr>
                        ) : filteredUnits.length === 0 && searchTerm ? (
                          <tr>
                            <td colSpan="2" className="text-center">
                              No matching units found
                            </td>
                          </tr>
                        ) : (
                          filteredUnits.map((unit) => (
                            <tr key={unit.id}>
                              <td>{unit.unitName}</td>
                              <td>
                                <Button
                                  variant="link"
                                  className="action-button edit-button me-2"
                                  onClick={() => openEditModal(unit)}
                                >
                                  <FaEdit />
                                </Button>
                                <Button
                                  variant="link"
                                  className="action-button delete-button"
                                  onClick={() => openDeleteModal(unit)}
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

      {/* Modals */}
      <AddUnitModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onConfirm={handleAddUnit} />
      <EditUnitModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedUnit(null)
        }}
        onConfirm={handleEditUnit}
        unit={selectedUnit}
      />
      <DeleteUnitModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedUnit(null)
        }}
        onConfirm={handleDeleteUnit}
        unit={selectedUnit}
      />
      <ConfirmEditModal
        isOpen={isConfirmEditModalOpen}
        onClose={() => {
          setIsConfirmEditModalOpen(false)
          setSelectedUnit(null)
          setNewUnitName("")
        }}
        onConfirm={confirmEditUnit}
        currentName={selectedUnit?.unitName}
        newName={newUnitName}
      />

      {/* Toastify Container */}
      <ToastContainer />

      <style>
        {`
          .units-setup-container {
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

          /* Modal Styles */
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
            padding: 2rem;
            border-radius: 8px;
            width: 90%;
            max-width: 400px;
          }

          .modal-title {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            color: #333;
            text-align: center;
          }

          .modal-body {
            margin-bottom: 1.5rem;
          }

          .modal-buttons {
            display: flex;
            justify-content: center;
            gap: 1rem;
          }

          .modal-button {
            padding: 0.5rem 2rem;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
            transition: opacity 0.2s;
          }

          .modal-button.confirm {
            background-color: #0B3D7B;
            color: white;
          }

          .modal-button.delete {
            background-color: #dc3545;
            color: white;
          }

          .modal-button.cancel {
            background-color: #6c757d;
            color: white;
          }

          .custom-input {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #ced4da;
            border-radius: 4px;
          }

          /* Toastify custom styles */
          .Toastify__toast-container {
            z-index: 9999;
          }

          .Toastify__toast {
            background-color: #0B3D7B;
            color: white;
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

          .gap-2 {
            gap: 0.5rem;
          }
        `}
      </style>
    </MainContentPage>
  )
}

export default UnitsSetup