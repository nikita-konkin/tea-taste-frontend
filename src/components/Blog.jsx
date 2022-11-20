import React, {
  useState,
  useEffect,
  useRef
} from 'react'

import Header from './Header.jsx'

function Blog(props) {


	return(
		<>
		<Header navigation={props.navigation}/>
		<h2>Тут будет Блог</h2>
		</>

		)
}

export default Blog;