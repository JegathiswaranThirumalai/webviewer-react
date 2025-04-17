import React, { useRef, useEffect, useState } from "react";
import WebViewer from "@pdftron/webviewer";
import "./App.css";

const readMode = [
  "annotationToolGroup",
  "toolbarGroup-View",
  "notesPanelToggle",
  "markReplaceTextToolButton",
  "tools-header",
];

const documents = [
  {
    id: "1",
    name: "Document 1",
    url: "https://s2.q4cdn.com/175719177/files/doc_presentations/Placeholder-PDF.pdf",
    readonly: true,
  },
  {
    id: "2",
    name: "Document 2",
    url: "https://cdn.prod.website-files.com/65fa22606ece141248b61294/66817734b6817ed383b61f6a_placeholder_pdf.pdf",
    readonly: false,
  },
  {
    id: "3",
    name: "Document 3",
    url: "https://cdn.prod.website-files.com/65fa22606ece141248b61294/66817734b6817ed383b61f6a_placeholder_pdf.pdf",
    readonly: true,
  },
];

// Add helper function to remove buttons in readonly mode
const removeButtons = (instance) => {
  const { UI } = instance;
  readMode.forEach((element) => {
    UI.disableElements([element]);
  });
};

// First, let's create a mock API function
const mockFetchDocument = async (id: string) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const doc = documents.find((doc) => doc.id === id);
  if (!doc) {
    throw new Error("Document not found");
  }
  return doc;
};

const App = () => {
  const viewer = useRef(null);
  const [selectedDoc, setSelectedDoc] = useState(documents[0].id);
  const [instance, setInstance] = useState(null);
  const [loading, setLoading] = useState(false); // Add loading state

  // Initial WebViewer setup
  useEffect(() => {
    WebViewer.WebComponent(
      {
        path: "/webviewer/lib",
        licenseKey: "your_license_key",
      },
      viewer.current
    ).then((viewerInstance) => {
      const { documentViewer, annotationManager, Annotations } =
        viewerInstance.Core;
      setInstance(viewerInstance);

      // Load initial document
      documentViewer.loadDocument(documents[0].url);

      // Set initial readonly state
      if (documents[0].readonly) {
        annotationManager.disableRedaction();
        annotationManager.enableReadOnlyMode();
        viewerInstance.UI.disableElements(readMode);
        removeButtons(viewerInstance);
      }
    });
  }, []);

  // Update handleDocumentChange to use mock API
  const handleDocumentChange = async (e) => {
    const newDocId = e.target.value;
    setSelectedDoc(newDocId);
    setLoading(true); // Start loading

    try {
      // Mock API call
      const selectedDocument = await mockFetchDocument(newDocId);

      if (instance && selectedDocument) {
        await instance.Core.documentViewer.loadDocument(selectedDocument.url);

        // Handle readonly mode
        const {
          UI,
          Core: { annotationManager },
        } = instance;

        if (selectedDocument.readonly) {
          annotationManager.disableRedaction();
          annotationManager.enableReadOnlyMode();
          UI.disableElements(readMode);
          removeButtons(instance);
        } else {
          annotationManager.enableRedaction();
          annotationManager.disableReadOnlyMode();
          UI.enableElements(readMode);
        }
      }
    } catch (error) {
      console.error("Error loading document:", error);
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <div className="App">
      <div className="header">
        React sample
        <select
          value={selectedDoc}
          onChange={handleDocumentChange}
          style={{ marginLeft: "20px" }}
          disabled={loading}
        >
          {documents.map((doc) => (
            <option key={doc.id} value={doc.id}>
              {doc.name}
            </option>
          ))}
        </select>
        {loading && <span style={{ marginLeft: "10px" }}>Loading...</span>}
      </div>
      <div className="webviewer" ref={viewer}></div>
    </div>
  );
};

export default App;
