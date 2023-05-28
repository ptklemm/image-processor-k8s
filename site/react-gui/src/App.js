import React, { useState } from 'react';
import axios from 'axios';

const acceptedFileTypes = [
    "image/png",
    "image/jpeg",
    "image/bmp"
];

function App() {
    const [selectedFile, setSelectedFile] = useState();
    const [isSelected, setIsSelected] = useState(false);

    const changeHandler = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
        setIsSelected(true);
    };

    const validate = (file) => {
        // validate input file here
        return true;
    }

    const handleSubmission = () => {
        if (validate(selectedFile)) {
            axios.postForm('http://localhost:8080/upload', { file: selectedFile });
        }
    };

    return (
        <React.Fragment>
            <header>
                <h1>image-processor</h1>
            </header>
            <form enctype="multipart/form-data">
                <input type="file" name="file" accept={acceptedFileTypes.join(",")} onChange={changeHandler} />
                {isSelected ? (
                    <div>
                        <p>Filename: {selectedFile.name}</p>
                        <p>Filetype: {selectedFile.type}</p>
                        <p>Size in bytes: {selectedFile.size}</p>
                        <p>
                            lastModifiedDate:{' '}
                            {selectedFile.lastModifiedDate.toLocaleDateString()}
                        </p>
                    </div>
                ) : (
                    <p>Select a file to show details</p>
                )}
                <div>
                    <button onClick={handleSubmission}>Submit</button>
                </div>
            </form>
        </React.Fragment>
    );
}

export default App;
