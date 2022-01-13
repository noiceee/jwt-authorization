import { useRef, useState } from 'react';
import './App.scss';
import axios from 'axios';
axios.defaults.baseURL = "http://localhost:5000/api";

function App() {

  const username = useRef("");
  const password = useRef("");
  const [user, setUser] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [couldDelete, setCloudDelete] = useState("");

  function handleSubmit(){
    console.log({"username":username.current.value, "password":password.current.value});
    axios.post('/login', {
      "username": username.current.value,
      "password": password.current.value
    }).then((res)=>{
      console.log(res);
      setUser(res.data);
    }).catch(err=>{
      setIsCorrect(true);
      console.log(err);
      console.log("Error agayo");
    });
  }

  function refreshToken(){
    axios.post("/refresh", {
      token: user.refreshToken
    }).then((res)=>{
      setUser({
        ...user,
        accessToken : res.data.accessToken,
        refreshToken : res.data.refreshToken
      }) 
    }).catch(err=>{
      console.log(err.response);
    })
  }

  const axiosJWT = axios.create();
  axiosJWT.interceptors.request.use(function (config) {
    // Do something before request is sent
    refreshToken();
    return config;
  }, function (error) {
    // Do something with request error
    return Promise.reject(error);
  });


  function handleDelete(uname){
    console.table(user);
    axiosJWT.delete(
      "/users/"+uname,
      {
        headers:{authorization:"bearer "+user.accessToken}
      }
    ).then(
      (res)=>{
        if(res.status == 200){
          setCloudDelete(res.data);
        }
      }
    ).catch(
      (err)=>{
        setCloudDelete(err.response.data);
      }
    )
  }

  return (
    !user?(
      <form className="container" onSubmit={(e)=>{
        e.preventDefault();
        handleSubmit();
      }}>
        <h1>Login</h1>
        <div>
          <input type="text" placeholder='Username' ref={username}/>
          <input type="password" placeholder='Password' ref={password}/>
          <span style={{display: !isCorrect ? "none" : "block"}}>Username or password incorrect!</span>
          <button type='submit'>Login</button>
        </div>
      </form>
    ) :  (
      <div className='container'>
        <h2>Welcome to {user.isAdmin?"Admin":"User"} Console</h2>
        <div>
          <button onClick={()=>handleDelete("hqhqhq")}>Delete hqhqhq (user)</button>
          <button onClick={()=>handleDelete("huehue")}>Delete huehue (admin)</button>
          <span className='delete'>{couldDelete}</span>
        </div>
      </div>
    )
  );
}

export default App;
