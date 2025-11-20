import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { okaidia } from 'react-syntax-highlighter/dist/esm/styles/prism';
import "prismjs/themes/prism-okaidia.css";
import { IoMdClose } from "react-icons/io";


const App = () => {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const terminalRef = useRef(null);
  const [openIng,setOpenImg] = useState(false);

  const handleImg=()=>{
    setOpenImg(prev=>!prev);
  }

  // Initial output when component mounts
  useEffect(() => {
    setOutput([
      { type: 'system', text: '===================================================================' },
      { type: 'system', text: '                          ** STORE **' },
      { type: 'system', text: '        Anonymous Text & Image Sharing. No Logins. 30d Expiry.' },
      { type: 'system', text: '===================================================================' },
      { type: 'system', text: 'Type \'help\'  for a list of commands and and press (Ctrl + enter ) to run or directly click on run button' },
      { type: 'system', text: '' },
    ]);
  }, []);

  // Scroll to bottom when output changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  // random key generate krne ka function
  const generateKey = () => {
    const adjectives = ['quick', 'lazy', 'happy', 'brave', 'calm', 'eager', 'gentle', 'jolly', 'kind', 'proud'];
    const nouns = ['fox', 'dog', 'dragon', 'tiger', 'eagle', 'wolf', 'lion', 'bear', 'hawk', 'shark'];
    const numbers = Math.floor(Math.random() * 90) + 10;

    const adj1 = adjectives[Math.floor(Math.random() * adjectives.length)];
    const adj2 = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];

    return `${adj1}-${adj2}-${noun}-${numbers}`;
  };

  // data ko save krne ka function
  const handleSaveText = async (text) => {
    setIsProcessing(true);

    const key = generateKey();

    try {
      console.log("Backend URL:", import.meta.env.VITE_BACKEND_URL);
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/data/savedata`, {
        key,
        data: text,
        dataType: 'text'
      });
      setCommand('')

      setOutput(prev => [
        ...prev,
        { type: 'system', text: response.data.message },
        { type: 'success', text: `Your unique key is: ${key}` },
        { type: 'system', text: `Keep this key safe. It will expire in 30 days.` },
        { type: 'prompt', text: '' },
      ]);
    } catch (error) {
      console.error('Error saving text:', error);
      const errorMessage = error.response?.data?.message || "Error while saving data";
      setOutput(prev => [
        ...prev,
        { type: 'error', text: errorMessage },
        { type: 'prompt', text: '' },
      ]);
    }

    setIsProcessing(false);
  };

  const handleSaveImage = async (imageFile) => {
    setIsProcessing(true);

    const key = generateKey();

    try {
      const formData = new FormData();
      formData.append('data', imageFile);
      formData.append('key', key);
      formData.append('type', 'file');

      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/data/savedata`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setOutput(prev => [
        ...prev,
        { type: 'system', text: `File '${imageFile.name}' received.` },
        { type: 'system', text: response.data.message },
        { type: 'success', text: `Your unique key is: ${key}` },
        { type: 'system', text: `Keep this key safe. It will expire in 30 days.` },
        { type: 'prompt', text: '' },
      ]);
    } catch (error) {
      console.error('Error saving image:', error);
      const errorMessage = error.response?.data?.message || "Error while saving image";
      setOutput(prev => [
        ...prev,
        { type: 'error', text: errorMessage },
        { type: 'prompt', text: '' },
      ]);
    }

    setIsProcessing(false);
    setFile(null);
  };

  const handleRetrieve = async (key) => {
    setIsProcessing(true);

    let data = '';
    try {
      console.log("key", key)
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/data/get-data`, {
        key
      });
      console.log("Response Data", response.data)
      if (response.data && response.data.data) {
        const resData = response.data.data;
        if (resData.type === 'text') {
          data = { type: 'text', content: resData.data };
        } else if (resData.type === 'file') {
          data = { type: 'image', content: resData.data };
          setOpenImg(true);
        }
      } else {
        data = null;
      }
      // console.log("Data", data)
    } catch (error) {
      console.error('Error retrieving data:', error);
    }

    if (data) {
      setOutput(prev => [
        ...prev,
        { type: 'system', text: `[RETRIEVING...]` },
        { type: 'system', text: '---' },
        data.type === 'text'
          ? { type: 'retrieved-text', text: data.content }
          : { type: 'retrieved-image', url: data.content },
        { type: 'system', text: '---' },
        { type: 'prompt', text: '' },
      ]);
    } else {
      setOutput(prev => [
        ...prev,
        { type: 'error', text: `Error: Key "${key}" not found.` },
        { type: 'prompt', text: '' },
      ]);
    }

    setIsProcessing(false);
  };

  // NEW: Update key functionality
  const handleUpdateKey = async (oldKey, newKey) => {
    setIsProcessing(true);

    try {
      const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/data/update-key`, {
        oldKey,
        newKey
      });

      setOutput(prev => [
        ...prev,
        { type: 'system', text: response.data.message },
        { type: 'success', text: `Key updated from "${oldKey}" to "${newKey}"` },
        { type: 'prompt', text: '' },
      ]);
    } catch (error) {
      console.error('Error updating key:', error);
      const errorMessage = error.response?.data?.message || "Error while updating key";
      setOutput(prev => [
        ...prev,
        { type: 'error', text: errorMessage },
        { type: 'prompt', text: '' },
      ]);
    }

    setIsProcessing(false);
  };

  const showHelp = () => {
    setOutput(prev => [
      ...prev,
      { type: 'system', text: '---' },
      { type: 'system', text: 'COMMANDS:' },
      { type: 'system', text: '  - Just type your text and press [ENTER] to save it.' },
      { type: 'system', text: '  - Type "upload" to attach and save an image file.' },
      { type: 'system', text: '  - Type a key (e.g., "red-dragon-42") to retrieve data.' },
      { type: 'system', text: '  - Type "--updatekey oldKey = newKey" to update a key (e.g., " --updatekey abc-123 = xyz-789")' },
      { type: 'system', text: '  - Type "help" to see this message again.' },
      { type: 'system', text: '  - Type "clear" to clear the terminal.' },
      { type: 'system', text: '  - Press (Ctrl + Enter ) to submit' },
      { type: 'system', text: '---' },
      { type: 'prompt', text: '' },
    ]);
  };

  const clearTerminal = () => {
    setOutput([
      { type: 'system', text: 'Terminal cleared.' },
      { type: 'system', text: 'Type \'help\' for a list of commands.' },
      { type: 'prompt', text: '' },
    ]);
  };



  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type.startsWith('image/')) {
        setFile(selectedFile);
        handleSaveImage(selectedFile);
      } else {
        setOutput(prev => [
          ...prev,
          { type: 'error', text: 'Error: Only image files are supported.' },
          { type: 'prompt', text: '' },
        ]);
      }
    }
    e.target.value = '';
  };

  // Function to detect if text contains code
  const containsCode = (text) => {
    const codePatterns = [
      /```[\s\S]*?```/g, // Code blocks
      /`[^`]*`/g, // Inline code
      /<(\/)?(code|pre)>/g, // HTML code tags
      /\b(function|const|let|var|if|else|for|while|return|class|import|export)\b/,
      /[{};=<>]/ // Common code characters
    ];
    return codePatterns.some(pattern => pattern.test(text));
  };

  // Function to detect programming language
  const detectLanguage = (text) => {
    if (text.includes('function') || text.includes('const') || text.includes('let') || text.includes('var')) return 'javascript';
    if (text.includes('def ') || text.includes('import ') || text.includes('print(')) return 'python';
    if (text.includes('<?php') || text.includes('echo ') || text.includes('$')) return 'php';
    if (text.includes('#include') || text.includes('int main')) return 'c';
    if (text.includes('public class') || text.includes('System.out')) return 'java';
    if (text.includes('<html') || text.includes('<div') || text.includes('</')) return 'html';
    if (text.includes('import React') || text.includes('useState') || text.includes('useEffect')) return 'jsx';
    return 'text';
  };

  const renderOutput = (item, index) => {
    switch (item.type) {
      case 'system':
        return <div key={index} className="text-green-400">{item.text}</div>;
      case 'command':
        return <div key={index} className="text-gray-300">vikram&gt; {item.text}</div>;
      case 'success':
        return <div key={index} className="text-yellow-300 font-bold">{item.text}</div>;
      case 'error':
        return <div key={index} className="text-red-400">{item.text}</div>;
      case 'retrieved-text':
        // Check if the content contains code
        if (containsCode(item.text)) {
          const language = detectLanguage(item.text);
          return (
            <div key={index} className="bg-gray-800  rounded border-l-4 border-green-500 my-2 overflow-hidden">

              <SyntaxHighlighter
                language={language}
                style={okaidia}
                customStyle={{
                  margin: 0,
                  borderRadius: '0 0 0.25rem 0',
                  fontSize: '0.875rem',
                  lineHeight: '1.25rem',
                  height: 'auto',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  backgroundColor: 'transparent',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#4B5563 transparent',
                }}
                showLineNumbers={item.text.split('\n').length > 5}
                wrapLongLines
              >
                {item.text}
              </SyntaxHighlighter>
            </div>
          );
        } else {
          return (
            <div key={index} className="bg-gray-800 p-3 rounded border-l-4  border-blue-500 text-gray-200 my-2 whitespace-pre-wrap">
              {item.text}
            </div>
          );
        }
      case 'retrieved-image':
        return (
          <div onClick={handleImg} key={index} className="my-2 cursor-pointer w-[90vw]">
            <img src={item.url} alt="Retrieved" className="max-w-md rounded border-2 border-green-500 w-[90vw]" />
          </div>
        );
      case 'prompt':
        return (
          <div key={index} className="flex items-center">
            <span className="text-green-400">vikram\save&gt;</span>
            {isProcessing ? (
              <span className="ml-2 text-yellow-400">Processing...</span>
            ) : (
              <div className="ml-2 w-3 h-5 bg-green-400 animate-blink"></div>
            )}
          </div>
        );
      default:
        return <div key={index} className="text-gray-400">{item.text}</div>;
    }
  };

  const handleCommand = (e,button) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if (((e.ctrlKey || e.metaKey) && e.key === 'Enter') || (button == "run")) {
      e.preventDefault();
      const cmd = command.trim();

      if (!cmd) {
        setOutput(prev => [...prev, { type: 'prompt', text: '' }]);
        setCommand('');
        return;
      }

      setOutput(prev => [...prev, { type: 'command', text: cmd }]);

      if (cmd.toLowerCase() === 'help') {
        showHelp();
      } else if (cmd.toLowerCase() === 'clear') {
        clearTerminal();
      } else if (cmd.toLowerCase() === 'upload') {
        fileInputRef.current?.click();
        setOutput(prev => [...prev, { type: 'system', text: 'Please select an image file...' }, { type: 'prompt', text: '' }]);
      } else if (cmd.startsWith('upload ') && cmd.length > 7) {
        setOutput(prev => [...prev, { type: 'system', text: 'Please use just "upload" and then select your file.' }, { type: 'prompt', text: '' }]);
      } else if (cmd.startsWith('--updatekey')) {
        const keyPart = cmd.replace('--updatekey', '').trim();
        const parts = keyPart.split('=').map(part => part.trim());

        if (parts.length === 2 && parts[0] && parts[1]) {
          const [oldKey, newKey] = parts;
          const keyRegex = /^[a-zA-Z]+-[a-zA-Z]+-[a-zA-Z]+-\d+$/;

          if (keyRegex.test(oldKey) && keyRegex.test(newKey)) {
            handleUpdateKey(oldKey, newKey);
          } else {
            setOutput(prev => [
              ...prev,
              { type: 'error', text: 'Error: Both keys must be in format: word-word-word-number (e.g., quick-fox-jumps-42)' },
              { type: 'prompt', text: '' },
            ]);
          }
        } else {
          setOutput(prev => [
            ...prev,
            { type: 'error', text: 'Error: Use format: --updatekey oldKey = newKey' },
            { type: 'prompt', text: '' },
          ]);
        }
      } else if (/^[a-zA-Z]+-[a-zA-Z]+-[a-zA-Z]+-\d+$/.test(cmd)) {
        handleRetrieve(cmd);
      } else {
        handleSaveText(cmd);
      }

      setCommand('');
    }
    // Allow normal Enter for new lines
    else if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey) {
      // Just allow default behavior (new line)
      return;
    }
  };


  return (
  <div className="h-[100dvh] bg-gray-900  flex items-center justify-center  wrap-anywhere ">
    <div className="w-full max-w-6xl h-full overflow-hidden">
    
      <div
        ref={terminalRef}
        className="h-full p-4 overflow-y-auto font-mono text-sm bg-gray-900 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
   
        {output.map(renderOutput)}

      
        <div className="flex items-start mt-2 max-h-[280px]">
          <span className="text-green-400">vikram&gt;</span>

          <textarea
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleCommand}
            className="bg-transparent text-gray-200 outline-none ml-2 font-mono flex-1 resize-none h-60"
            placeholder={isProcessing ? "Processing..." : "Type your code... (Ctrl+Enter to submit)"}
            disabled={isProcessing}
            autoFocus
          />
          <button className='bg-green-500 rounded-md text-white px-4 py-2' onClick={(e)=> {handleCommand(e,'run')}}>Run</button>

          {isProcessing && (
            <span className="text-yellow-400 ml-2 self-center">Processing...</span>
          )}
        </div>
      </div>

    
      {openIng && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-md">
          <IoMdClose
            className="z-10 absolute top-4 right-4 bg-green-500 p-2 cursor-pointer text-white rounded-full h-10 w-10"
            onClick={handleImg}
          />
          <img
            src={output.find((item) => item.type === 'retrieved-image')?.url}
            alt="Retrieved"
            className="md:w-[800px] w-[90vw] h-[90vh] object-contain rounded border-2 border-green-500"
          />
        </div>
      )}

    
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Footer */}
      <div className="bg-gray-800 px-4 py-2 text-center text-gray-400 text-xs font-mono absolute bottom-0 m-auto left-0 right-0 ">
        All data expires in 30 days • No login required • Secure and anonymous *click( Ctrl + Enter ) to run
      </div>
    </div>
  </div>
);

};

export default App;