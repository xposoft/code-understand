"use client"

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MainContentPage from '../../../components/MainContent/MainContentPage';
import { Form, Button, Row, Col, Card, Table, ListGroup, Modal } from 'react-bootstrap';

import {Link} from 'react-router-dom'

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Add Custom Unit Modal Component
const AddCustomUnitModal = ({ isOpen, onClose, onConfirm, unitName }) => {
  if (!isOpen) return null;

  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add Custom Unit</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Do you want to add "{unitName}" as a new unit?</p>
        <p>This unit will be available for future use.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={() => onConfirm(unitName)}>
          Add Unit
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const BookMaterialPurchase = () => {
  const navigate = useNavigate();
  const [entryData, setEntryData] = useState({
    entryNo: '',
    entryDate: new Date().toISOString().split('T')[0],
    invoiceNo: '',
    supplierCode: '',
    supplierName: '',
    address: '',
    stockQty: ''
  });

  const [grossAmount, setGrossAmount] = useState(0);
  const [tableItems, setTableItems] = useState([
    { id: 1, description: '', head: '', std: '', unit: '', qty: '', rate: '', gst: '', total: '' }
  ]);
  
  // Supplier search state
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [showCodeDropdown, setShowCodeDropdown] = useState(false);
  const [showNameDropdown, setShowNameDropdown] = useState(false);
  const [storeId, setStoreId] = useState(null);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [entryNumberLocked, setEntryNumberLocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Book search state
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [activeDescriptionField, setActiveDescriptionField] = useState(null);
  const [showDescriptionDropdown, setShowDescriptionDropdown] = useState(false);
  
  // Unit state
  const [units, setUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [activeUnitField, setActiveUnitField] = useState(null);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [customUnitName, setCustomUnitName] = useState('');
  
  // Standard/Course state
  const [standards, setStandards] = useState([]);
  const [filteredStandards, setFilteredStandards] = useState([]);
  const [activeStdField, setActiveStdField] = useState(null);
  const [showStdDropdown, setShowStdDropdown] = useState(false);
  const [administrationId, setAdministrationId] = useState(null);
  
  // Category Head state
  const [categoryHeads, setCategoryHeads] = useState([]);
  const [filteredCategoryHeads, setFilteredCategoryHeads] = useState([]);
  const [activeHeadField, setActiveHeadField] = useState(null);
  const [showHeadDropdown, setShowHeadDropdown] = useState(false);
  
  // Refs for dropdowns
  const codeDropdownRef = useRef(null);
  const nameDropdownRef = useRef(null);
  const descriptionDropdownRef = useRef(null);
  const unitDropdownRef = useRef(null);
  const stdDropdownRef = useRef(null);
  const headDropdownRef = useRef(null);
  const formRef = useRef(null);

  // Handle input changes for the form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEntryData(prev => ({
      ...prev,
      [name]: value
    }));

    // If supplier code changes, filter suppliers
    if (name === 'supplierCode') {
      // Clear previous timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      
      // Set new timeout for search
      const timeoutId = setTimeout(() => {
        filterSuppliersByCode(value);
      }, 300);
      
      setSearchTimeout(timeoutId);
    }

    // If supplier name changes, filter suppliers
    if (name === 'supplierName') {
      // Clear previous timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      
      // Set new timeout for search
      const timeoutId = setTimeout(() => {
        filterSuppliersByName(value);
      }, 300);
      
      setSearchTimeout(timeoutId);
    }
  };

  // Filter suppliers based on code
  const filterSuppliersByCode = (term) => {
    if (!term.trim()) {
      // If empty, show all suppliers
      setFilteredSuppliers(suppliers);
    } else {
      // Filter by code
      const filtered = suppliers.filter(supplier => 
        supplier.supplierCode.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredSuppliers(filtered);
    }
    setShowCodeDropdown(true);
  };

  // Filter suppliers based on name
  const filterSuppliersByName = (term) => {
    if (!term.trim()) {
      // If empty, show all suppliers
      setFilteredSuppliers(suppliers);
    } else {
      // Filter by name
      const filtered = suppliers.filter(supplier => 
        supplier.supplierName.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredSuppliers(filtered);
    }
    setShowNameDropdown(true);
  };

  // Filter books based on description
  const filterBooks = (term) => {
    if (!term.trim()) {
      // If empty, show all books
      setFilteredBooks(books);
    } else {
      // Filter by book name
      const filtered = books.filter(book => 
        book.bookname.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredBooks(filtered);
    }
  };

  // Filter units based on input
  const filterUnits = (term) => {
    if (!term.trim()) {
      // If empty, show all units
      setFilteredUnits(units);
    } else {
      // Filter by unit name
      const filtered = units.filter(unit => 
        unit.unitName.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredUnits(filtered);
    }
  };

  // Filter standards based on input
  const filterStandards = (term) => {
    if (!term.trim()) {
      // If empty, show all standards
      setFilteredStandards(standards);
    } else {
      // Filter by standard name
      const filtered = standards.filter(std => 
        std.standard.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredStandards(filtered);
    }
  };

  // Filter category heads based on input
  const filterCategoryHeads = (term) => {
    if (!term.trim()) {
      // If empty, show all category heads
      setFilteredCategoryHeads(categoryHeads);
    } else {
      // Filter by category name
      const filtered = categoryHeads.filter(head => 
        head.newCategory.toLowerCase().includes(term.toLowerCase()) ||
        head.accountHead.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredCategoryHeads(filtered);
    }
  };

  // Handle click on supplier code input to show dropdown
  const handleSupplierCodeClick = () => {
    // Show all suppliers in dropdown when clicked
    setFilteredSuppliers(suppliers);
    setShowCodeDropdown(true);
    setShowNameDropdown(false);
  };

  // Handle click on supplier name input to show dropdown
  const handleSupplierNameClick = () => {
    // Show all suppliers in dropdown when clicked
    setFilteredSuppliers(suppliers);
    setShowNameDropdown(true);
    setShowCodeDropdown(false);
  };

  // Handle click on description field to show book dropdown
  const handleDescriptionClick = (itemId) => {
    setActiveDescriptionField(itemId);
    setFilteredBooks(books);
    setShowDescriptionDropdown(true);
    setShowUnitDropdown(false); // Close other dropdowns
    setShowStdDropdown(false); // Close other dropdowns
    setShowHeadDropdown(false); // Close other dropdowns
  };

  // Handle click on unit field to show unit dropdown
  const handleUnitClick = (itemId) => {
    setActiveUnitField(itemId);
    setFilteredUnits(units);
    setShowUnitDropdown(true);
    setShowDescriptionDropdown(false); // Close other dropdowns
    setShowStdDropdown(false); // Close other dropdowns
    setShowHeadDropdown(false); // Close other dropdowns
  };

  // Handle click on std field to show standard dropdown
  const handleStdClick = (itemId) => {
    setActiveStdField(itemId);
    setFilteredStandards(standards);
    setShowStdDropdown(true);
    setShowDescriptionDropdown(false); // Close other dropdowns
    setShowUnitDropdown(false); // Close other dropdowns
    setShowHeadDropdown(false); // Close other dropdowns
  };

  // Handle click on head field to show category head dropdown
  const handleHeadClick = (itemId) => {
    setActiveHeadField(itemId);
    setFilteredCategoryHeads(categoryHeads);
    setShowHeadDropdown(true);
    setShowDescriptionDropdown(false); // Close other dropdowns
    setShowUnitDropdown(false); // Close other dropdowns
    setShowStdDropdown(false); // Close other dropdowns
  };

  // Handle changes in the table items
  const handleTableItemChange = (id, field, value) => {
    const updatedItems = tableItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // If description field is being changed, filter books
        if (field === 'description') {
          filterBooks(value);
        }
        
        // If unit field is being changed, filter units
        if (field === 'unit') {
          filterUnits(value);
          
          // Check if the unit exists, if not, show add unit modal
          const unitExists = units.some(unit => 
            unit.unitName.toLowerCase() === value.toLowerCase()
          );
          
          if (!unitExists && value.trim() !== '') {
            setCustomUnitName(value);
            setShowAddUnitModal(true);
          }
        }
        
        // If std field is being changed, filter standards
        if (field === 'std') {
          filterStandards(value);
        }
        
        // If head field is being changed, filter category heads
        if (field === 'head') {
          filterCategoryHeads(value);
        }
        
        // Calculate total if qty, rate, or gst changes
        if (field === 'qty' || field === 'rate' || field === 'gst') {
          const qty = parseFloat(field === 'qty' ? value : item.qty) || 0;
          const rate = parseFloat(field === 'rate' ? value : item.rate) || 0;
          const gst = parseFloat(field === 'gst' ? value : item.gst) || 0;
          
          // Calculate base amount (qty * rate)
          const baseAmount = qty * rate;
          
          // Add GST amount to the base amount
          const total = baseAmount + (baseAmount * (gst / 100));
          
          updatedItem.total = total.toFixed(2);
        }
        
        return updatedItem;
      }
      return item;
    });
    
    setTableItems(updatedItems);
  };

  // Handle book selection from dropdown
  const handleBookSelect = (book) => {
    if (!activeDescriptionField) return;
    
    const updatedItems = tableItems.map(item => {
      if (item.id === activeDescriptionField) {
        // Get current GST value
        const gst = parseFloat(item.gst) || 0;
        
        // Calculate base amount
        const baseAmount = parseFloat(book.amount || 0) * (parseFloat(item.qty) || 1);
        
        // Calculate total with GST
        const total = baseAmount + (baseAmount * (gst / 100));
        
        // Set description to book name and rate to book amount
        return {
          ...item,
          description: book.bookname,
          rate: book.amount || '0',
          total: total.toFixed(2)
        };
      }
      return item;
    });
    
    setTableItems(updatedItems);
    setShowDescriptionDropdown(false);
    setActiveDescriptionField(null);
  };

  // Handle unit selection from dropdown
  const handleUnitSelect = (unit) => {
    if (!activeUnitField) return;
    
    const updatedItems = tableItems.map(item => {
      if (item.id === activeUnitField) {
        return {
          ...item,
          unit: unit.unitName
        };
      }
      return item;
    });
    
    setTableItems(updatedItems);
    setShowUnitDropdown(false);
    setActiveUnitField(null);
  };

  // Handle standard selection from dropdown
  const handleStdSelect = (std) => {
    if (!activeStdField) return;
    
    const updatedItems = tableItems.map(item => {
      if (item.id === activeStdField) {
        return {
          ...item,
          std: std.standard
        };
      }
      return item;
    });
    
    setTableItems(updatedItems);
    setShowStdDropdown(false);
    setActiveStdField(null);
  };

  // Handle category head selection from dropdown
  const handleHeadSelect = (head) => {
    if (!activeHeadField) return;
    
    const updatedItems = tableItems.map(item => {
      if (item.id === activeHeadField) {
        return {
          ...item,
          head: head.newCategory
        };
      }
      return item;
    });
    
    setTableItems(updatedItems);
    setShowHeadDropdown(false);
    setActiveHeadField(null);
  };

  // Handle adding a custom unit
  const handleAddCustomUnit = async (unitName) => {
    if (!storeId || !auth.currentUser) {
      toast.error('Store not initialized or user not logged in. Please try again.');
      return;
    }

    try {
      const unitsRef = collection(db, "Schools", auth.currentUser.uid, "Store", storeId, "UnitsSetup");
      const docRef = await addDoc(unitsRef, { unitName });
      
      // Add to local state
      const newUnit = { id: docRef.id, unitName };
      setUnits(prevUnits => [...prevUnits, newUnit]);
      
      // Update the table item
      if (activeUnitField) {
        const updatedItems = tableItems.map(item => {
          if (item.id === activeUnitField) {
            return {
              ...item,
              unit: unitName
            };
          }
          return item;
        });
        
        setTableItems(updatedItems);
        setActiveUnitField(null);
      }
      
      toast.success('Unit added successfully!', {
        style: { background: "#0B3D7B", color: "white" },
      });
      
      setShowAddUnitModal(false);
      setCustomUnitName('');
    } catch (error) {
      console.error('Error adding unit:', error);
      toast.error('Failed to add unit. Please try again.');
    }
  };

  // Delete a row from the table
  const handleDeleteRow = (id) => {
    // If there's only one row, clear it instead of removing it
    if (tableItems.length === 1) {
      setTableItems([{ 
        id: 1, 
        description: '', 
        head: '', 
        std: '', 
        unit: '', 
        qty: '', 
        rate: '', 
        gst: '', 
        total: '' 
      }]);
      toast.info('Row cleared');
      return;
    }
    
    // Filter out the row with the given id
    const updatedItems = tableItems.filter(item => item.id !== id);
    setTableItems(updatedItems);
    toast.success('Row deleted successfully');
  };

  // Add a new row to the table
  const handleAddRow = () => {
    const newId = tableItems.length > 0 ? Math.max(...tableItems.map(item => item.id)) + 1 : 1;
    setTableItems([...tableItems, { 
      id: newId, 
      description: '', 
      head: '', 
      std: '', 
      unit: '', 
      qty: '', 
      rate: '', 
      gst: '', 
      total: '' 
    }]);
  };

  // Calculate gross amount whenever table items change
  useEffect(() => {
    const total = tableItems.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
    setGrossAmount(total.toFixed(2));
  }, [tableItems]);

  // Validate form before submission
  const validateForm = () => {
    if (!entryData.entryNo) {
      toast.error('Entry number is required');
      return false;
    }
    
    if (!entryData.entryDate) {
      toast.error('Entry date is required');
      return false;
    }
    
    if (!entryData.invoiceNo) {
      toast.error('Invoice/Bill number is required');
      return false;
    }
    
    if (!entryData.supplierCode || !entryData.supplierName) {
      toast.error('Supplier information is required');
      return false;
    }
    
    // Check if at least one item has been added with required fields
    const validItems = tableItems.filter(item => 
      item.description && 
      item.qty && 
      item.rate && 
      parseFloat(item.qty) > 0 && 
      parseFloat(item.rate) > 0
    );
    
    if (validItems.length === 0) {
      toast.error('At least one item with description, quantity, and rate is required');
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!storeId) {
      toast.error('Store not initialized. Please try again.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare data for saving
      const purchaseData = {
        entryNo: entryData.entryNo,
        entryDate: new Date(entryData.entryDate),
        invoiceNo: entryData.invoiceNo,
        supplierCode: entryData.supplierCode,
        supplierName: entryData.supplierName,
        address: entryData.address,
        stockQty: entryData.stockQty,
        grossAmount: grossAmount,
        items: tableItems.map(item => ({
          description: item.description,
          head: item.head,
          std: item.std,
          unit: item.unit,
          qty: item.qty,
          rate: item.rate,
          gst: item.gst,
          total: item.total
        })),
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser.uid,
        status: 'active'
      };
      
      // Save to Firebase with auto-generated ID
      const purchaseRef = collection(
        db, 
        "Schools", 
        auth.currentUser.uid, 
        "Store", 
        storeId, 
        "BookMaterialPurchase"
      );
      
      const docRef = await addDoc(purchaseRef, purchaseData);
      
      console.log('Purchase entry saved with ID:', docRef.id);
      toast.success('Purchase entry saved successfully!');
      
      // Reset the entry number lock to generate a new one for the next entry
      setEntryNumberLocked(false);
      
      // Reset form
      handleReset();
    } catch (error) {
      console.error('Error saving purchase entry:', error);
      toast.error('Failed to save purchase entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle reset/new form
  const handleReset = () => {
    setEntryData(prev => ({
      ...prev,
      invoiceNo: '',
      supplierCode: '',
      supplierName: '',
      address: '',
      stockQty: ''
    }));
    setTableItems([{ id: 1, description: '', head: '', std: '', unit: '', qty: '', rate: '', gst: '', total: '' }]);
    setGrossAmount(0);
  };

  // Prevent form submission on Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      return false;
    }
  };

  // Navigate to view page
  const handleViewClick = () => {
    // Try multiple navigation approaches to ensure it works
    try {
      // Approach 1: Direct navigation to the view page
      navigate('/book-material-purchase-view');
      
      // Approach 2: If the above doesn't work, try with a relative path
      // navigate('../book-material-purchase-view');
      
      // Approach 3: If using nested routes, try with the full path
      // navigate('/transaction/book-transaction/book-material-purchase-view');
      
      console.log("Navigating to book material purchase view page");
    } catch (error) {
      console.error("Navigation error:", error);
      
      // Fallback: Try window.location as a last resort
      window.location.href = '/book-material-purchase-view';
    }
  };

  // Fetch or create Store ID
  useEffect(() => {
    const fetchStoreId = async () => {
      try {
        const storeRef = collection(db, "Schools", auth.currentUser.uid, "Store");
        const q = query(storeRef, limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          toast.error("Store not initialized. Please set up store first.");
        } else {
          setStoreId(querySnapshot.docs[0].id);
        }
      } catch (error) {
        console.error("Error fetching Store ID:", error);
        toast.error("Failed to initialize. Please try again.");
      }
    };

    fetchStoreId();
  }, []);

  // Fetch Administration ID for standards
  useEffect(() => {
    const fetchAdministrationId = async () => {
      if (!auth.currentUser) return;

      try {
        const adminRef = collection(db, "Schools", auth.currentUser.uid, "Administration");
        const q = query(adminRef, limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const adminId = querySnapshot.docs[0].id;
          setAdministrationId(adminId);
          console.log("Existing Administration ID fetched:", adminId);
        }
      } catch (error) {
        console.error("Error fetching Administration ID:", error);
      }
    };

    fetchAdministrationId();
  }, []);

  // Generate entry number
  useEffect(() => {
    const generateEntryNumber = async () => {
      if (!storeId || entryNumberLocked) return;

      try {
        // Use a transaction to safely get and update the next entry number
        await runTransaction(db, async (transaction) => {
          // Reference to the EntryNumberSequence document in the BookMaterialPurchase collection
          const entrySequenceRef = doc(
            db,
            "Schools",
            auth.currentUser.uid,
            "Store",
            storeId,
            "BookMaterialPurchase",
            "EntryNumberSequence"
          );

          // Get the current sequence value
          const entrySequenceDoc = await transaction.get(entrySequenceRef);

          const currentDate = new Date();
          const financialYear = `${currentDate.getFullYear()}-${(currentDate.getFullYear() + 1).toString().slice(-2)}`;

          let nextNumber = 1;

          // If sequence document exists, increment it
          if (entrySequenceDoc.exists()) {
            const sequenceData = entrySequenceDoc.data();
            // Check if we're in a new financial year
            if (sequenceData.financialYear === financialYear) {
              nextNumber = sequenceData.currentNumber + 1;
            } else {
              // Reset counter for new financial year
              nextNumber = 1;
            }
          }

          // Update the sequence document
          transaction.set(entrySequenceRef, {
            currentNumber: nextNumber,
            financialYear: financialYear,
            lastUpdated: serverTimestamp(),
            module: "BookMaterialPurchase",
          });

          // Format the entry number with leading zeros
          const formattedNumber = String(nextNumber).padStart(2, '0');
          const newEntryNumber = `ENT-${formattedNumber}`;
          
          // Set the entry number
          setEntryData(prev => ({ ...prev, entryNo: newEntryNumber }));
          setEntryNumberLocked(true);
        });
      } catch (error) {
        console.error("Error generating entry number:", error);
        toast.error("Failed to generate entry number");
      }
    };

    if (storeId && !entryNumberLocked) {
      generateEntryNumber();
    }
  }, [storeId, entryNumberLocked]);

  // Fetch all suppliers, books, units, and category heads on component mount
  useEffect(() => {
    if (storeId) {
      fetchAllSuppliers();
      fetchAllBooks();
      fetchAllUnits();
      fetchAllCategoryHeads();
    }
  }, [storeId]);

  // Fetch all standards when administrationId is available
  useEffect(() => {
    if (administrationId) {
      fetchAllStandards();
    }
  }, [administrationId]);

  // Fetch all suppliers
  const fetchAllSuppliers = async () => {
    if (!storeId) return;

    try {
      const suppliersRef = collection(db, "Schools", auth.currentUser.uid, "Store", storeId, "SupplierSetup");
      const querySnapshot = await getDocs(suppliersRef);
      const suppliersData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSuppliers(suppliersData);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast.error("Failed to fetch suppliers. Please try again.");
    }
  };

  // Fetch all books
  const fetchAllBooks = async () => {
    if (!storeId) return;

    try {
      const booksRef = collection(db, "Schools", auth.currentUser.uid, "Store", storeId, "BookSetup");
      const querySnapshot = await getDocs(booksRef);
      const booksData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setBooks(booksData);
    } catch (error) {
      console.error("Error fetching books:", error);
      toast.error("Failed to fetch books. Please try again.");
    }
  };

  // Fetch all units
  const fetchAllUnits = async () => {
    if (!storeId) return;

    try {
      const unitsRef = collection(db, "Schools", auth.currentUser.uid, "Store", storeId, "UnitsSetup");
      const querySnapshot = await getDocs(unitsRef);
      const unitsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUnits(unitsData);
    } catch (error) {
      console.error("Error fetching units:", error);
      toast.error("Failed to fetch units. Please try again.");
    }
  };

  // Fetch all standards
  const fetchAllStandards = async () => {
    if (!administrationId || !auth.currentUser) return;

    try {
      const coursesRef = collection(db, "Schools", auth.currentUser.uid, "Administration", administrationId, "Courses");
      const querySnapshot = await getDocs(coursesRef);
      const coursesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setStandards(coursesData);
      console.log("Fetched standards:", coursesData);
    } catch (error) {
      console.error("Error fetching standards:", error);
      toast.error("Failed to fetch standards. Please try again.");
    }
  };

  // Fetch all category heads
  const fetchAllCategoryHeads = async () => {
    if (!storeId) return;

    try {
      const categoryHeadsRef = collection(db, "Schools", auth.currentUser.uid, "Store", storeId, "CategoryHead");
      const querySnapshot = await getDocs(categoryHeadsRef);
      const categoryHeadsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCategoryHeads(categoryHeadsData);
      console.log("Fetched category heads:", categoryHeadsData);
    } catch (error) {
      console.error("Error fetching category heads:", error);
      toast.error("Failed to fetch category heads. Please try again.");
    }
  };

  // Handle supplier selection from dropdown
  const handleSupplierSelect = (supplier) => {
    setEntryData(prev => ({
      ...prev,
      supplierCode: supplier.supplierCode,
      supplierName: supplier.supplierName,
      address: supplier.address || ''
    }));
    
    setShowCodeDropdown(false);
    setShowNameDropdown(false);
    toast.success("Supplier details loaded successfully");
  };

  // Handle click outside dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (codeDropdownRef.current && !codeDropdownRef.current.contains(event.target)) {
        setShowCodeDropdown(false);
      }
      if (nameDropdownRef.current && !nameDropdownRef.current.contains(event.target)) {
        setShowNameDropdown(false);
      }
      if (descriptionDropdownRef.current && !descriptionDropdownRef.current.contains(event.target)) {
        setShowDescriptionDropdown(false);
        setActiveDescriptionField(null);
      }
      if (unitDropdownRef.current && !unitDropdownRef.current.contains(event.target)) {
        setShowUnitDropdown(false);
        setActiveUnitField(null);
      }
      if (stdDropdownRef.current && !stdDropdownRef.current.contains(event.target)) {
        setShowStdDropdown(false);
        setActiveStdField(null);
      }
      if (headDropdownRef.current && !headDropdownRef.current.contains(event.target)) {
        setShowHeadDropdown(false);
        setActiveHeadField(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    }
  }, []);

  // Handle manual save button click
  const handleSaveClick = (e) => {
    e.preventDefault();
    handleSubmit(e);
  };

  return (
    <MainContentPage>
      <div className="container-fluid px-4 py-3">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <h4 className="fw-bold">Book/Material Purchase</h4>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="mb-4">
          <nav className="d-flex custom-breadcrumb py-1 py-lg-3">
            <a href="/home" className="text-decoration-none">Home</a>
            <span className="separator mx-2"></span>
            <div>Transaction</div>
            <span className="separator mx-2"></span>
            <div>Book Transaction</div>
            <span className="separator mx-2"></span>
            <span>Book/Material Purchase</span>
          </nav>
        </div>

        <Card className="shadow-sm mb-4">
          <Card.Header className="text-white py-3" style={{ backgroundColor: '#0B3D7B' }}>
            <h5 className="mb-0">Purchase Entry Window</h5>
          </Card.Header>
          <Card.Body style={{ backgroundColor: '#E3F2FD' }}>
            <Form ref={formRef} onKeyDown={handleKeyDown} onSubmit={(e) => e.preventDefault()}>
              <Row className="mb-3">
                {/* First Column */}
                <Col md={4}>
                  <Form.Group className="mb-2">
                    <Form.Label>Entry No.</Form.Label>
                    <Form.Control
                      type="text"
                      name="entryNo"
                      value={entryData.entryNo}
                      onChange={handleInputChange}
                      disabled
                      className="bg-light"
                    />
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label>Entry Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="entryDate"
                      value={entryData.entryDate}
                      onChange={handleInputChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label>Inv./Bill No.</Form.Label>
                    <Form.Control
                      type="text"
                      name="invoiceNo"
                      value={entryData.invoiceNo}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>

                {/* Second Column */}
                <Col md={4}>
                  <Form.Group className="mb-2 position-relative" ref={codeDropdownRef}>
                    <Form.Label>Sup. Code</Form.Label>
                    <Form.Control
                      type="text"
                      name="supplierCode"
                      value={entryData.supplierCode}
                      onChange={handleInputChange}
                      onClick={handleSupplierCodeClick}
                      placeholder="Enter supplier code"
                      autoComplete="off"
                    />
                    {showCodeDropdown && filteredSuppliers.length > 0 && (
                      <div className="position-absolute w-100" style={{ zIndex: 9999 }}>
                        <ListGroup className="dropdown-menu show w-100">
                          {filteredSuppliers.map((supplier) => (
                            <ListGroup.Item
                              key={supplier.id}
                              action
                              onClick={() => handleSupplierSelect(supplier)}
                              className="dropdown-item"
                            >
                              {supplier.supplierCode} - {supplier.supplierName}
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      </div>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-2 position-relative" ref={nameDropdownRef}>
                    <Form.Label>Supplier Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="supplierName"
                      value={entryData.supplierName}
                      onChange={handleInputChange}
                      onClick={handleSupplierNameClick}
                      placeholder="Search supplier name"
                      autoComplete="off"
                    />
                    {showNameDropdown && filteredSuppliers.length > 0 && (
                      <div className="position-absolute w-100" style={{ zIndex: 9999 }}>
                        <ListGroup className="dropdown-menu show w-100">
                          {filteredSuppliers.map((supplier) => (
                            <ListGroup.Item
                              key={supplier.id}
                              action
                              onClick={() => handleSupplierSelect(supplier)}
                              className="dropdown-item"
                            >
                              {supplier.supplierCode} - {supplier.supplierName}
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      </div>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      type="text"
                      name="address"
                      value={entryData.address}
                      onChange={handleInputChange}
                      placeholder="Supplier address"
                    />
                  </Form.Group>
                </Col>

                {/* Third Column */}
                <Col md={4}>
                  <Form.Group className="mb-2">
                    <Form.Label>Stock Qty</Form.Label>
                    <Form.Control
                      type="number"
                      name="stockQty"
                      value={entryData.stockQty}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Table */}
              <div className="table-responsive mb-3">
                <Table bordered hover>
                  <thead style={{ backgroundColor: '#9C27B0', color: 'white' }}>
                    <tr>
                      <th>S.N</th>
                      <th>Description</th>
                      <th>Head</th>
                      <th>Std</th>
                      <th>Unit</th>
                      <th>Qty</th>
                      <th>Rate</th>
                      <th>GST %</th>
                      <th>Total</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody style={{ backgroundColor: 'white' }}>
                    {tableItems.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>
                        <td style={{ position: 'relative' }}>
                          <Form.Control
                            type="text"
                            size="sm"
                            value={item.description}
                            onChange={(e) => handleTableItemChange(item.id, 'description', e.target.value)}
                            onClick={() => handleDescriptionClick(item.id)}
                            autoComplete="off"
                          />
                          {showDescriptionDropdown && activeDescriptionField === item.id && (
                            <div 
                              ref={descriptionDropdownRef}
                              className="table-dropdown-container"
                              style={{ 
                                position: 'absolute', 
                                top: '100%', 
                                left: 0, 
                                width: '100%', 
                                zIndex: 99999,
                                maxHeight: '400px',
                                overflowY: 'auto',
                                backgroundColor: 'white',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                                border: '1px solid #ced4da',
                                borderRadius: '4px'
                              }}
                            >
                              {filteredBooks.length > 0 ? (
                                filteredBooks.map((book) => (
                                  <div
                                    key={book.id}
                                    className="dropdown-item p-2"
                                    onClick={() => handleBookSelect(book)}
                                    style={{ cursor: 'pointer', borderBottom: '1px solid #eee' }}
                                  >
                                    {book.bookname} - ₹{book.amount || '0'}
                                  </div>
                                ))
                              ) : (
                                <div className="p-2 text-center">No books found</div>
                              )}
                            </div>
                          )}
                        </td>
                        <td style={{ position: 'relative' }}>
                          <Form.Control
                            type="text"
                            size="sm"
                            value={item.head}
                            onChange={(e) => handleTableItemChange(item.id, 'head', e.target.value)}
                            onClick={() => handleHeadClick(item.id)}
                            autoComplete="off"
                          />
                          {showHeadDropdown && activeHeadField === item.id && (
                            <div 
                              ref={headDropdownRef}
                              className="table-dropdown-container"
                              style={{ 
                                position: 'absolute', 
                                top: '100%', 
                                left: 0, 
                                width: '100%', 
                                zIndex: 99999,
                                maxHeight: '400px',
                                overflowY: 'auto',
                                backgroundColor: 'white',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                                border: '1px solid #ced4da',
                                borderRadius: '4px'
                              }}
                            >
                              {filteredCategoryHeads.length > 0 ? (
                                filteredCategoryHeads.map((head) => (
                                  <div
                                    key={head.id}
                                    className="dropdown-item p-2"
                                    onClick={() => handleHeadSelect(head)}
                                    style={{ cursor: 'pointer', borderBottom: '1px solid #eee' }}
                                  >
                                    <div>{head.newCategory}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                      Account: {head.accountHead}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="p-2 text-center">No category heads found</div>
                              )}
                            </div>
                          )}
                        </td>
                        <td style={{ position: 'relative' }}>
                          <Form.Control
                            type="text"
                            size="sm"
                            value={item.std}
                            onChange={(e) => handleTableItemChange(item.id, 'std', e.target.value)}
                            onClick={() => handleStdClick(item.id)}
                            autoComplete="off"
                          />
                          {showStdDropdown && activeStdField === item.id && (
                            <div 
                              ref={stdDropdownRef}
                              className="table-dropdown-container"
                              style={{ 
                                position: 'absolute', 
                                top: '100%', 
                                left: 0, 
                                width: '100%', 
                                zIndex: 99999,
                                maxHeight: '400px',
                                overflowY: 'auto',
                                backgroundColor: 'white',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                                border: '1px solid #ced4da',
                                borderRadius: '4px'
                              }}
                            >
                              {filteredStandards.length > 0 ? (
                                filteredStandards.map((std) => (
                                  <div
                                    key={std.id}
                                    className="dropdown-item p-2"
                                    onClick={() => handleStdSelect(std)}
                                    style={{ cursor: 'pointer', borderBottom: '1px solid #eee' }}
                                  >
                                    {std.standard}
                                  </div>
                                ))
                              ) : (
                                <div className="p-2 text-center">No standards found</div>
                              )}
                            </div>
                          )}
                        </td>
                        <td style={{ position: 'relative' }}>
                          <Form.Control
                            type="text"
                            size="sm"
                            value={item.unit}
                            onChange={(e) => handleTableItemChange(item.id, 'unit', e.target.value)}
                            onClick={() => handleUnitClick(item.id)}
                            autoComplete="off"
                          />
                          {showUnitDropdown && activeUnitField === item.id && (
                            <div 
                              ref={unitDropdownRef}
                              className="table-dropdown-container"
                              style={{ 
                                position: 'absolute', 
                                top: '100%', 
                                left: 0, 
                                width: '100%', 
                                zIndex: 99999,
                                maxHeight: '400px',
                                overflowY: 'auto',
                                backgroundColor: 'white',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                                border: '1px solid #ced4da',
                                borderRadius: '4px'
                              }}
                            >
                              {filteredUnits.length > 0 ? (
                                filteredUnits.map((unit) => (
                                  <div
                                    key={unit.id}
                                    className="dropdown-item p-2"
                                    onClick={() => handleUnitSelect(unit)}
                                    style={{ cursor: 'pointer', borderBottom: '1px solid #eee' }}
                                  >
                                    {unit.unitName}
                                  </div>
                                ))
                              ) : (
                                <div className="p-2 text-center">No units found</div>
                              )}
                            </div>
                          )}
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            size="sm"
                            value={item.qty}
                            onChange={(e) => handleTableItemChange(item.id, 'qty', e.target.value)}
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            size="sm"
                            value={item.rate}
                            onChange={(e) => handleTableItemChange(item.id, 'rate', e.target.value)}
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            size="sm"
                            value={item.gst}
                            onChange={(e) => handleTableItemChange(item.id, 'gst', e.target.value)}
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="text"
                            size="sm"
                            value={item.total}
                            readOnly
                          />
                        </td>
                        <td>
                          <Button 
                            variant="danger" 
                            size="sm" 
                            onClick={() => handleDeleteRow(item.id)}
                            style={{ padding: '0.25rem 0.5rem' }}
                          >
                            <i className="fas fa-trash-alt"></i> Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {/* Empty row for new entries */}
                    <tr>
                      <td colSpan="10" className="text-center">
                        <Button 
                          variant="light" 
                          size="sm" 
                          onClick={handleAddRow}
                          className="border"
                        >
                          + Add Row
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>

              {/* Action Buttons and Gross Amount */}
              <Row>
                <Col md={8}>
                  <div className="d-flex flex-wrap gap-2">
                    <Button 
                      variant="success" 
                      onClick={handleSaveClick}
                      style={{ backgroundColor: '#4CAF50', borderColor: '#4CAF50' }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : 'Save'}
                    </Button>
                  <Link to='/book/book-material-view' >
                  <Button 
                      variant="primary"
                      style={{ backgroundColor: '#2196F3', borderColor: '#2196F3' }}
                   
                    >
                      View
                    </Button>
                  </Link>
                    <Button 
                      variant="danger"
                      style={{ backgroundColor: '#F44336', borderColor: '#F44336' }}
                    >
                      Delete
                    </Button>
                    <Button 
                      variant="info"
                      className="text-white"
                      style={{ backgroundColor: '#00BCD4', borderColor: '#00BCD4' }}
                    >
                      Stock
                    </Button>
                    <Button 
                      variant="secondary"
                      style={{ backgroundColor: '#9E9E9E', borderColor: '#9E9E9E' }}
                    >
                      Item Setup
                    </Button>
                    <Button 
                      variant="warning"
                      className="text-dark"
                      style={{ backgroundColor: '#FFC107', borderColor: '#FFC107' }}
                    >
                      Sales Reports
                    </Button>
                    <Button 
                      variant="dark"
                      style={{ backgroundColor: '#607D8B', borderColor: '#607D8B' }}
                    >
                      Exit
                    </Button>
                  </div>
                </Col>
                <Col md={4}>
                  <Card>
                    <Card.Body> 
                      <h6 className="card-title">Gross Amt</h6>
                      
                      {/* Book Items List with Prices */}
                      <div className="book-items-list mb-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {tableItems.filter(item => item.description && item.total).map((item, index) => (
                          <div key={index} className="d-flex justify-content-between align-items-center mb-2 p-2" style={{ backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                            <div className="text-start" style={{ fontSize: '0.9rem', maxWidth: '70%' }}>
                              <div className="fw-bold text-truncate">{item.description}</div>
                              <div className="text-muted small">
                                {item.qty} {item.unit} × ₹{item.rate}
                                {item.gst && item.gst !== '0' ? ` + ${item.gst}% GST` : ''}
                              </div>
                            </div>
                            <div className="text-end fw-bold">₹{item.total}</div>
                          </div>
                        ))}
                        
                        {tableItems.filter(item => item.description && item.total).length === 0 && (
                          <div className="text-center text-muted p-3">
                            No items added yet
                          </div>
                        )}
                      </div>
                      
                      {/* Total Amount */}
                      <div className="border-top pt-2">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-bold">Total Amount:</span>
                          <span className="fw-bold">₹{grossAmount}</span>
                        </div>
                        <Form.Control
                          type="text"
                          value={grossAmount}
                          readOnly
                          className="text-end fw-bold"
                        />
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
      </div>

      {/* Add Custom Unit Modal */}
      <AddCustomUnitModal
        isOpen={showAddUnitModal}
        onClose={() => setShowAddUnitModal(false)}
        onConfirm={handleAddCustomUnit}
        unitName={customUnitName}
      />

      {/* Toastify Container */}
      <ToastContainer />

      <style jsx>{`
        .custom-breadcrumb {
          background-color: #f8f9fa;
          border-radius: 4px;
        }

        .custom-breadcrumb a {
          color: #007bff;
          text-decoration: none;
        }

        .custom-breadcrumb a:hover {
          text-decoration: underline;
        }

        .custom-breadcrumb .separator {
          color: #6c757d;
        }

        .custom-breadcrumb div {
          color: #6c757d;
        }

        .table-responsive {
          max-height: 400px;
          overflow-y: auto;
          border: 1px solid #ddd;
          border-radius: 4px;
          position: relative;
        }

        .form-control {
          background-color: #fff;
          border: 1px solid #ced4da;
        }

        .form-control:focus {
          border-color: #80bdff;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }

        .btn {
          min-width: 100px;
          margin-right: 5px;
          margin-bottom: 5px;
        }

        thead th {
          position: sticky;
          top: 0;
          z-index: 1;
        }

        .dropdown-menu {
          display: block;
          width: 100%;
          max-height: 300px;
          overflow-y: auto;
          border: 1px solid #ced4da;
          border-radius: 4px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .dropdown-item {
          padding: 8px 12px;
          cursor: pointer;
          white-space: normal;
          word-break: break-word;
        }

        .dropdown-item:hover {
          background-color: #f8f9fa;
        }

        .table-dropdown-container {
          max-height: 300px;
          overflow-y: auto;
        }

        /* Fix for dropdown z-index issues */
        .table-responsive {
          overflow: visible !important;
        }
        
        table {
          position: relative;
        }
        
        tbody tr {
          position: relative;
        }
        
        tbody td {
          position: relative;
        }
        
        .book-items-list {
          border: 1px solid #dee2e6;
          border-radius: 4px;
          background-color: white;
        }
      `}</style>
    </MainContentPage>
  );
};

export default BookMaterialPurchase;