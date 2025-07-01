import axios from 'axios';
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { useState, useEffect, useCallback } from "react";
import MultiSelect from "../components/multi-select";
import FileView from "../components/view-file";
import GenericModal from "../components/generic-modal";
import { useAuth } from "../contextes/auth-context";
import useFileUpload from "../hooks/usefileupload";
import "../style/cards.css";
import { FaFolderPlus } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";

const HOST = import.meta.env.VITE_APP_HOST;

const FileTable = () => {
  const { user } = useAuth();

  // Folder modal state
  const [folderName, setFolderName] = useState("");
  
  // Existing state variables
  const [queryData, setQueryData] = useState([]);
  const [fileMetaData, setFileMetaData] = useState([]);
  const [filenameOptions, setFilenameOptions] = useState([]);
  const [fileExtensionOptions, setFileExtensionOptions] = useState([]);
  const [fileOwnerOptions, setFileOwnerOptions] = useState([]);
  const [selectedFilenameOptions, setSelectedFilenameOptions] = useState([]);
  const [selectedFileExtensionOptions, setSelectedFileExtensionOptions] = useState([]);
  const [selectedFileOwnerOptions, setSelectedFileOwnerOptions] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [resultMessage, setResultMessage] = useState(null);

  // Folder modal handlers
  const handleOpenFolderModal = () => setShowFolderModal(true);
  const handleCloseFolderModal = () => setShowFolderModal(false);
  const createFolder = async () => {
    if (folderName.trim().length > 0) {
      await axios.post(`http://${HOST}/folders`, { name: folderName });
      setFolderName("");
      handleCloseFolderModal();
      fetchFiles();
    }
  };

  // Upload modal handlers
  const handleCloseUploadModal = () => setShowUploadModal(false);
  const handleShowUploadModal = () => setShowUploadModal(true);

  // Select handlers
  const handleNameSelect = vData => setSelectedFilenameOptions(vData || []);
  const handleExtensionSelect = vData => setSelectedFileExtensionOptions(vData || []);
  const handleOwnerSelect = vData => setSelectedFileOwnerOptions(vData || []);

  // Download/Delete handlers
  const handleFileDownload = (response) => setResultMessage(response);
  const handleFileDelete = (response) => {
    setResultMessage(response);
    fetchFiles();
  };

  // File upload hook
  const uploadUrl = `http://${HOST}/upload`;
  const { handleFileChange, handleUpload, resultMsg } = useFileUpload(uploadUrl, handleCloseUploadModal);

  const handleFileUpload = async () => {
    if (user) {
      const { success, message } = await handleUpload();
      if (success) {        
        fetchFiles(); // Refresh the file list shown in the table
      } else {
        setResultMessage(message);
      }
    } else {
      console.error("User not logged in");
    }
  };

  // Effect: set result message from upload
  useEffect(() => {
    if (resultMsg) setResultMessage(resultMsg);
  }, [resultMsg]);

  // triggers metadata fetching from the database server
  useEffect(() => {
    // Initial fetch on component mount
    fetchFiles();

    // Set up the interval to fetch every 20 seconds
    const intervalId = setInterval(() => {      
      fetchFiles();
    }, 20000); // 20,000 milliseconds = 20 seconds

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Fetch metadata
  const fetchFiles = async () => {
    try {
      const response = await axios.get(`http://${HOST}/getFiles`);
      if (response.status === 200) {
        setQueryData(response.data.message);
      } else {
        console.error('Failed to fetch files');
      }
    } catch (error) {
      console.error(error.response?.data.message || error.message);
    }
  };
  
  // Generate unique select options from file metadata
  const generateSelectOptions = useCallback((data, key) => {
    if (!data || data.length === 0) return [];
    return [...new Set(data.map((item) => item[key]))].map((value) => ({
      label: value,
      value,
    }));
  }, []);

  // Set the select options for filename, file extension, and file owner
  const setStatesForSelectOptionsFromBaseData = useCallback(
    (data) => {
      if (!data || data.length === 0) {
        setFilenameOptions([]);
        setFileExtensionOptions([]);
        setFileOwnerOptions([]);
        return;
      }

      // Generate select options from query data or filtered data
      const uniqueFilenames =
        selectedFilenameOptions.length > 0
          ? generateSelectOptions(queryData, "name")
          : generateSelectOptions(data, "name");
      const uniqueFileExtensions =
        selectedFileExtensionOptions.length > 0
          ? generateSelectOptions(queryData, "file_type")
          : generateSelectOptions(data, "file_type");
      const uniqueFileOwners =
        selectedFileOwnerOptions.length > 0
          ? generateSelectOptions(queryData, "username")
          : generateSelectOptions(data, "username");

      setFilenameOptions(uniqueFilenames);
      setFileExtensionOptions(uniqueFileExtensions);
      setFileOwnerOptions(uniqueFileOwners);
    },
    [
      queryData,
      generateSelectOptions,
      selectedFilenameOptions,
      selectedFileExtensionOptions,
      selectedFileOwnerOptions,
    ]
  );

  // Update the file metadata and select options when the query data changes
  useEffect(() => {
    if (!queryData) return;

    setFileMetaData(queryData);
    setStatesForSelectOptionsFromBaseData(queryData);
  }, [queryData, setStatesForSelectOptionsFromBaseData]);

  // Update the file metadata and select options when the select options change
  useEffect(() => {
    if (!queryData) return;
    let filteredData = queryData;
    if (selectedFilenameOptions.length) {
      filteredData = filteredData.filter(file => selectedFilenameOptions.map(o => o.value).includes(file.name));
    }
    if (selectedFileExtensionOptions.length) {
      filteredData = filteredData.filter(file => selectedFileExtensionOptions.map(o => o.value).includes(file.file_type));
    }
    if (selectedFileOwnerOptions.length) {
      filteredData = filteredData.filter(file => selectedFileOwnerOptions.map(o => o.value).includes(file.username));
    }
    setStatesForSelectOptionsFromBaseData(filteredData);
    setFileMetaData(filteredData);
  }, [
    selectedFilenameOptions,
    selectedFileExtensionOptions,
    selectedFileOwnerOptions,
    queryData,
    setStatesForSelectOptionsFromBaseData,
  ]);

  // Render the file views from the file metadata
  const renderFileViews = (data) => {
    return data.map((file, index) => (
      <FileView key={index} file_meta_data={file} onDelete={handleFileDelete} onDownload={handleFileDownload} />
    ));
  };
  
  return (
    <Container fluid style={{ marginTop: '30px', marginBottom: '30px' }}>
      <Row className="justify-content-center mb-3">
        <Col md={2}>
          <MultiSelect
            placeholder="Select filename"
            onChange={handleNameSelect}
            options={filenameOptions}
            value={selectedFilenameOptions}
            isMulti
          />
        </Col>
        <Col md={2}>
          <MultiSelect
            placeholder="Select file extension"
            onChange={handleExtensionSelect}
            options={fileExtensionOptions}
            value={selectedFileExtensionOptions}
            isMulti
          />
        </Col>
        <Col md={2}>
          <MultiSelect
            placeholder="Select owner"
            onChange={handleOwnerSelect}
            options={fileOwnerOptions}
            value={selectedFileOwnerOptions}
            isMulti
          />
        </Col>
        <Col md={3}></Col>
        <Col md={1} className="d-flex justify-content-end align-items-top">
          <Button
              variant="success"
              className="btn-md square-button mx-1"
              onClick={handleOpenFolderModal}
              disabled={!user}
          >
            <FaFolderPlus/>
          </Button>
          <GenericModal show={showFolderModal} title="Create New Folder" onClose={handleCloseFolderModal} onSubmit={createFolder} confirmText="Create">
            <input type="text" className="form-control" placeholder="Folder name" value={folderName} onChange={(e) => setFolderName(e.target.value)} />
          </GenericModal>
          <Button
            variant="success"
            className="btn-md square-button mx-1"
            onClick={handleShowUploadModal}
            disabled={!user}
          >
            <FiPlus />
          </Button>
          <GenericModal show={showUploadModal} title="Upload a new file" onClose={handleCloseUploadModal} onSubmit={handleFileUpload} confirmText="Upload">
            <input type="file" onChange={handleFileChange} className="file-input"/>
          </GenericModal>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md={4}></Col>
        <Col md={4} className="d-flex justify-content-center align-items-center">
          {resultMessage}
        </Col>
        <Col md={4}></Col>
      </Row>
      <Row className="justify-content-center">
        <Col md={10}>
          <Card bg="dark" text="white">
            <Card.Header>
              <Container fluid>
                <Row className="table-header">
                  <Col md={4}>Filename</Col>
                  <Col md={1}>Extension</Col>
                  <Col md={1}>Size</Col>
                  <Col md={2}>Owner</Col>
                  <Col md={2}>Modified</Col>
                  <Col md={2}>Actions</Col>
                </Row>
              </Container>
            </Card.Header>
            <Card.Body>
              {renderFileViews(fileMetaData)}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default FileTable;
