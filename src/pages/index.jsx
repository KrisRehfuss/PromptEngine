import Head from "next/head";
import { useState, useEffect } from "react";
import Image from "next/image";
import BlackHole1 from "../../public/iconnew.png";
import Cover from "../../public/Purple.jpg";
import CoverVert from "../../public/purpleVert.jpg";
import Nav from "./Nav";
// import { TextField, APIBar } from "./TextField";
import { CHUNK_SIZE } from "../../common/chunk.constant";
import { splitString } from "../../common/chunk.helper";
import callGPT from "../../common/openai";
// import { Analytics } from "@vercel/analytics/react";
// import Head from "next/head";
import { Configuration, OpenAIApi } from "openai";
import sequence from "../../common/sequence";
import Typewriter from "./TypeWriter";
import Banner from "./Banner";
// import styles from '@/styles/Home.module.css'

export default function Home() {
  const [requestInput, setRequestInput] = useState("Summarize the text below");
  const [textInput, setTextInput] = useState("");
  const [result, setResult] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [chunks, setChunks] = useState("");

  // Get the openai api key from the local storage
  const [openaiAPIKey, setOpenAIAPIKey] = useState("");

  // This useEffect will run once when the component mounts
  // It checks if the window and local storage exist, and if so, it
  // checks if there is an API key stored in local storage. If so, it
  // sets the openAIAPIKey state to the value of the key. It also checks
  // if there is an API request stored in local storage, and if so, it
  // sets the requestInput state to the value of the request.
  useEffect(() => {
    if (window && window.localStorage) {
      const key = window.localStorage.getItem("openaiAPIKey");
      if (key) {
        setOpenAIAPIKey(key);
      }

      const request = window.localStorage.getItem("request");
      if (request) {
        setRequestInput(request);
      }
    }
  }, []);

  // FUNCTIONS

  /**
   * This function calls the API server, which then calls the OpenAI API.
   * The OpenAI API uses the text sent as input and the request to generate a new text.
   * The API server then returns the generated text to this function.
   * The function return the generated text.
   * @param {*} chunk
   * @param {*} openaiAPIKey
   * @param {*} requestInput
   * @returns
   */
  async function processChunk(chunk, openaiAPIKey, requestInput) {
    const configuration = new Configuration({
      apiKey: openaiAPIKey,
    });
    const openai = new OpenAIApi(configuration);
    return callGPT(chunk, requestInput, openai);
  }

  function scrollToBottom() {
    window.scrollTo(0, document.body.scrollHeight);
  }

  /**
   * This function is called when the user clicks the submit button.
   * It calls the processChunk function in sequence for each chunk of the text.
   * It then sets the result state to the generated text.
   * @param {*} event
   */
  async function onSubmit(event) {
    event.preventDefault();
    try {
      setProcessing(true);

      setResult([]);

      await sequence(chunks, (chunk, index) => {
        scrollToBottom();
        setProgress(Math.round(((index - 1) / chunks.length) * 100));
        console.log(`Processing chunk: ${index} of ${chunks.length}`);

        return processChunk(chunk, openaiAPIKey, requestInput)
          .then((res) => {
            setResult((prevResult) => [...prevResult, res]);
          })
          .finally(() => {
            return result;
          });
      });
    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    } finally {
      setProcessing(false);
    }
  }

  /**
   * This function is called when the user enters a new API key.
   * It sets the openAIAPIKey state to the new key.
   * It also stores the key in the local storage.
   * @param {*} key
   */
  const setAPIKeyAndPersist = (key) => {
    setOpenAIAPIKey(key);
    if (window && window.localStorage) {
      window.localStorage.setItem("openaiAPIKey", key);
    }
  };

  /**
   * This function is called when the user enters a new request.
   * It sets the requestInput state to the new request.
   * It also stores the request in the local storage.
   * @param {*} request
   */
  const setRequestAndPersist = (request) => {
    setRequestInput(request);
    if (window && window.localStorage) {
      window.localStorage.setItem("request", request);
    }
  };

  const setTextAndChunks = (text) => {
    setTextInput(text);
    let chunks = splitString(text, CHUNK_SIZE);
    setChunks(chunks);
  };

  // Background-Changer
  const [imageUrl, setImageUrl] = useState(Cover);

  useEffect(() => {
    const handleResize = () => {
      const newImageUrl = window.innerWidth >= 768 ? Cover : CoverVert;
      setImageUrl(newImageUrl);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // RETURN

  return (
    <div>
      <Head>
        <title>Dashboard</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Background Image */}
      <div
        style={{
          zIndex: -100,
          position: "fixed",
        }}
      >
        <Image
          className="Clear"
          src={imageUrl}
          alt="black hole"
          // fill
          // objectFit="cover"
        />
      </div>
      <Nav />

      {/* Body Start */}
      <div className="relative FlexCenterCol font-pop border-sky-900 h-screen">
        {/* <Banner /> */}
        {/* <div className="w-screen h-12 border-b-sky-"></div> */}
        {/* Flex Canvas Start */}
        <div className="relative  FlexCenterCol  md:flex-row p-4 IceGrade BoxFull ">
          {/* <TextField /> */}

          {/* Intro Card */}
          <div className="MARK z-40 PromptEngine -mt-32 p-4 flex flex-col justify-between md:mr-6 Hover Glass h-full w-full md:w-1/4 md:flex-2 ">
            {/* Card Header */}

            <div className=" z-40 w-full items-center h-full flex flex-col ">
              <h1 className="NameShadow my-4 mb-8 text-4xl md:text-5xl font-bold text-left">
                Prompt <span className="text-violet-500">Engine </span>
              </h1>
              <div className=" text-white mr-8 BoxFit">
                {/* <Image
                  className="text-center mr-2 text-white Spin"
                  src={BlackHole1}
                  // width={50}
                  alt="#"
                /> */}
              </div>
              <div className=" flex flex-col justify-between items-center py-2 p-4 w-full h-fit border-violet-400">
                {/* Form Start */}
                <form className="w-full FlexCenterCol mx-auto" onSubmit={onSubmit}>

                  {/* OPENAI KEY */}
                  <div className="PromptGroup mx-auto flex flex-col  justify-center p-4">
                    <label className="Enter ">Enter your OpenAI API Key</label>
                    <textarea
                      className="max-h-{100px} textEngine overflow-hidden text-transparent focus:text-gray-600 shadow-2xl shadow-black  "
                      id=""
                      // rows={1}
                      type="text"
                      name="openaiAPIKey"
                      placeholder="Enter your OpenAI API Key"
                      value={openaiAPIKey}
                      onChange={(e) => setAPIKeyAndPersist(e.target.value)}
                    ></textarea>
                  </div>

                  {/* ENTER REQUEST */}
                  <div className="PromptGroup ">
                    <label className="Enter">Enter your request</label>
                    <textarea
                      className="h-fit textEngine shadow-2xl shadow-black "
                      id=""
                      // rows={2}
                      type="text"
                      name="request"
                      placeholder="Enter your request"
                      value={requestInput}
                      onChange={(e) => setRequestAndPersist(e.target.value)}
                    ></textarea>
                  </div>

                  {/* ENTER TEXT to PROCESS */}
                  <div className=" PromptGroup ">
                    <label className="Enter">
                      The text you want to process
                    </label>
                    <textarea
                      className="max-h-{200px} textEngine shadow-2xl shadow-black"
                      type="text"
                      name="text"
                      // rows={3}
                      // placeholder={`Enter your text here, there is no size limitation, the content will be split into ${CHUNK_SIZE} characters chunks. Each chunk will be processed separatly by openAI.`}
                      value={textInput}
                      onChange={(e) => setTextAndChunks(e.target.value)}
                    />
                  </div>

        {/* First one */}

                  {/* {!!textInput?.length && (
                    <div className="size">{`${textInput.length} characters - ${
                      parseInt(textInput.length / CHUNK_SIZE) + 1
                    } chunks to process`}</div>
                  )} */}
                  {!processing && (
                    <input
                      type="submit"
                      className="MARK mt-2 p-4 w-5/6 bg-green-800 cursor-pointer"
                      value="Process your request"
                    />
                  )}
                  {processing && (
                    <input
                      type="submit"
                      value="Processing wait a few seconds..."
                      disabled
                    />
                  )}
                  {processing && <progress value={progress} max="100" />}
                </form>
                {result && <div></div>}
              </div>
            </div>

            {/* First Text Box */}
            {/* <p className="p-4 leading-6 text-sm "></p> */}

            {/* </div> */}
          </div>

          {/* Column 2 */}
          <div className="BackingCard">
            {/* Main Dash */}

            {/* Dash Top Canvas */}
            <div className=" FlexCenter  z-50 p-4 h-1/2 w-full">
              <div className="DashTop BoxFit bg-slate-300">
                <Image
                  className="Round opacity-20 -z-30"
                  src={Cover}
                  alt="black hole"
                  fill
                  objectFit="cover"
                />
                {result.map((item, index) => {
                  return (
                    <>
                      <div className="Round">
                        <div className="BoxFit  Round  text-center">
                          <Typewriter key={`result-${index}`} text={item} />
                          {chunks.length > 1 && (
                            <div className={styles.partLabel}>
                              Part {index + 1}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  );
                })}
              </div>
            </div>

{/* Second one */}

            {!!textInput?.length && (
              <div className="size">{`${textInput.length} characters - ${
                parseInt(textInput.length / CHUNK_SIZE) + 1
              } chunks to process`}</div>
            )}
            {!processing && (
              <input
                type="submit"
                className="MARK hidden p-8 bg-blue-500 cursor-pointer"
                value="Process your request"
              />
            )}
            {processing && (
              <input
                type="submit"
                value="Processing wait a few seconds..."
                disabled
              />
            )}
            {processing && <progress value={progress} max="100" />}
            {result && <div></div>}
            
          </div>
        </div>
      </div>
    </div>
  );
}