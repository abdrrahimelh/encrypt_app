import React, { useRef, useState } from "react";
import "./App.css";
import StringCrypto from "string-crypto";
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/analytics";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp({
  apiKey: "AIzaSyABEPMeLah3wCOyKa38gz-oxByUzZllTEg",
  authDomain: "chat-encrypt.firebaseapp.com",
  projectId: "chat-encrypt",
  storageBucket: "chat-encrypt.appspot.com",
  messagingSenderId: "813966482173",
  appId: "1:813966482173:web:87b975e973257ea95b7c94",
  measurementId: "G-ZZEVPRYJJK",
});

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>💬</h1>
        <SignOut />
      </header>

      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
      <p>
        Do not violate the community guidelines or you will be banned for life!
      </p>
    </>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        Sign Out
      </button>
    )
  );
}

function ChatRoom() {
  const [locked, setLocked] = useState(true);
  const [key, setKey] = useState("");
  const [placeholder, setPlaceholder] = useState("enter todays key");

  const dummy = useRef();
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt").limit(100);

  const [messages] = useCollectionData(query, { idField: "id" });

  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;
    const { encryptString, decryptString } = new StringCrypto();
    let encryptedString = encryptString(formValue, "63i512j0i512l8.1195j0j7&s");
    console.log(decryptString(encryptedString, "63i512j0i512l8.1195j0j7&s"));
    await messagesRef.add({
      text: encryptedString,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };
  function EnterKey(e) {
    e.preventDefault();
    if (formValue == "hey") {
      setLocked(false);
      setPlaceholder("Write your message");
    }
    setFormValue("");


  }
  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} locked={locked} />)}

        <span ref={dummy}></span>
      </main>
      <div>
        <form onSubmit={sendMessage}>
          <input
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)}
            placeholder={placeholder}
          />
          {locked ? (
            <button onClick={EnterKey}>🔒</button>
          ) : (
            <button type="submit" disabled={!formValue}>
              🕊️
            </button>
          )}
        </form>
      </div>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";
  const { encryptString, decryptString } = new StringCrypto();
  return (
    <>
      <div className={`message ${messageClass}`}>
        <img
          src={
            photoURL || "https://api.adorable.io/avatars/23/abott@adorable.png"
          }
        />
        {props.locked? (<p>{text}</p>):<p>{decryptString(text, "63i512j0i512l8.1195j0j7&s")}</p>}
      </div>
    </>
  );
}

export default App;
