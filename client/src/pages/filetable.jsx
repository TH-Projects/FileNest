import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { useState, useEffect, useCallback } from "react";

import MultiSelect from "../components/multiselect";
import FileView from "../components/fileview";
import FileUpload from './fileupload';

import testData from "../testdata.json"; 
import "../style/cards.css"

const FileTable = () => {
  const [queryData, setQueryData] = useState([]);
  const [fileMetaData, setFileMetaData] = useState([]); 
  const [filenameOptions, setFilenameOptions] = useState([]); 
  const [fileExtensionOptions, setFileExtensionOptions] = useState([]); 
  const [fileOwnerOptions, setFileOwnerOptions] = useState([]); 

  const [selectedFilenameOptions, setSelectedFilenameOptions] = useState([]);
  const [selectedFileExtensionOptions, setSelectedFileExtensionOptions] = useState([]);
  const [selectedFileOwnerOptions, setSelectedFileOwnerOptions] = useState([]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const getSelectOptionsFromBaseData = useCallback((data) => {
    let uniqueFilenames;
    //when the filter for filenames is used the select shows all available files to allow multi select
    //when the filter is not used the select shows only the files that are in the prefiltred data
    if(selectedFilenameOptions.length >0){
      uniqueFilenames = [...new Set(queryData.map(file => file.name))].map(name => ({ label: name, value: name }));
    }else{
      uniqueFilenames = [...new Set(data.map(file => file.name))].map(name => ({ label: name, value: name }));
    }
    const uniqueFileExtensions = [...new Set(data.map(file => file.extension))].map(extension => ({ label: extension, value: extension }));
    const uniqueFileOwners = [...new Set(data.map(file => file.owner))].map(owner => ({ label: owner, value: owner }));

    return { uniqueFilenames, uniqueFileExtensions, uniqueFileOwners };
  },[queryData, selectedFilenameOptions]);

  const setStatesForSelectedOptions = useCallback((data) => {
    const { uniqueFilenames, uniqueFileExtensions, uniqueFileOwners } = getSelectOptionsFromBaseData(data);
    setFilenameOptions(uniqueFilenames);
    setFileExtensionOptions(uniqueFileExtensions);
    setFileOwnerOptions(uniqueFileOwners);
  },[getSelectOptionsFromBaseData]);

  //get data from initially
  useEffect(() => {
    setQueryData(testData);
  }, []);

  //get options for filters from data
  useEffect(() => {
    setFileMetaData(queryData);

   setStatesForSelectedOptions(queryData);
  }, [queryData, setStatesForSelectedOptions]);

  //filter data based on selected options
  useEffect(() => {
    let filteredData = queryData;
    if(selectedFilenameOptions.length > 0){
      filteredData = filteredData.filter(file => selectedFilenameOptions.map(option => option.value).includes(file.name));
    }
    if(selectedFileExtensionOptions.length > 0){
      filteredData = filteredData.filter(file => selectedFileExtensionOptions.map(option => option.value).includes(file.extension));
    }
    if(selectedFileOwnerOptions.length > 0){
      filteredData = filteredData.filter(file => selectedFileOwnerOptions.map(option => option.value).includes(file.owner));
    }
    setStatesForSelectedOptions(filteredData);
    setFileMetaData(filteredData);
  },[selectedFilenameOptions, selectedFileExtensionOptions, selectedFileOwnerOptions, queryData, setStatesForSelectedOptions]);

  //render file views based on data
  const renderFileViews = (data) => {
    return data.map((file, index) => (
      <FileView key={index} file_meta_data={file} />
    ));
  };

  //set values of selects to states
  const handleNameSelect = (vData) => setSelectedFilenameOptions(vData || []);
  const handleExtensionSelect = (vData) => setSelectedFileExtensionOptions(vData || []);
  const handleOwnerSelect = (vData) => setSelectedFileOwnerOptions(vData || []);

  //handle modal
  const handleCloseModal = () => setShowUploadModal(false);
  const handleShowModal = () => setShowUploadModal(true);

  //handle file upload of component
  const handleFileChange = (event) => setSelectedFile(event.target.files[0]);

  //upload file to minIO-microservice-server
  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData,
      });
      
      console.log(response);
      if (response.ok) {
        const data = await response.json();
        console.log('File uploaded successfully:', data);
        alert('Datei erfolgreich hochgeladen');
      } else {
        console.error('File upload failed:', response.statusText);
        alert('Fehler beim Hochladen der Datei');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Ein Fehler ist beim Hochladen aufgetreten');
    } finally {
      handleCloseModal();
    }
  };

  return (
    <Container fluid style={{ marginTop: "30px", marginBottom: "30px" }}>
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
          <Button variant="success" className="btn-md square-button" onClick={handleShowModal}>
          +
          </Button>
          <FileUpload 
            show={showUploadModal} 
            handleClose={handleCloseModal} 
            handleFileChange={handleFileChange}
            handleUpload={handleUpload}
          />
        </Col>
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
            <Card.Body>{renderFileViews(fileMetaData)}</Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default FileTable;
