import React, { useState, useEffect, useRef  } from 'react';
import SelectBox from './SelectBox.jsx';
import FormButton from './FormButton.jsx';

import { useTeaFormContext } from './TeaFormContext.jsx';

function AromaStages(props) {

	const categoryList = props.options.data.map((item) => ({title:item.category}));

	const [subcategories, setSubcategories] = useState([]);
	const [defaultSubcategories, setDefaultSubcategories] = useState([]);

	const [descriptors, setDescriptors] = useState([]);

	// Выбранные значения
	const [selectedCategory, setSelectedCategory] = useState("");
	const [selectedSubcategory, setSelectedSubcategory] = useState("");

	const [stages, setStages] = useState([])
	let [stagesCount, setStagesCount] = useState(1)
	let [prevStagesCount, setPrevStagesCount] = useState()
	const stagesArray = []

	const { 
		aromaStagesFormData, 
		updateAromaStagesFormData,
		subCategory,
		updateSubCategory,
        updateDefaultSubcategories
	} = useTeaFormContext();

	useEffect(() => {
		
		const obj_len = Object.keys(aromaStagesFormData).length
		const keys = Object.keys(aromaStagesFormData)

		if (obj_len != 0) {
			let lastStageNumber = 1
			for (let i = 0; i < obj_len-1; i++) {
				
				if (keys[i].split('').map(Number)[0] == props.straitNum) {
					lastStageNumber = keys[i].split('').map(Number)[1]
				} 

			}

			setStagesCount(lastStageNumber)
			addAromaStages(lastStageNumber)
			setStages(stagesArray)
			setPrevStagesCount(lastStageNumber)

		} else {
			clearStageArraysIf()
			addAromaStages(stagesCount)
			setStages(stagesArray)
			setPrevStagesCount(stagesCount)
		}


	}, []);

	const renderAromaStages = () => {
		clearStageArraysIf()
		addAromaStages(stagesCount)
		setStages(stagesArray)
		setPrevStagesCount(stagesCount)
	}

	// useEffect(() => {
	// 	if (selectedCategory) {
	// 		const selected = props.options.data.find((item) => item.category === selectedCategory.title);
	// 		// props.options.data.map((item) => ({title:item.category}));

	// 		const subcategoryList = selected ? selected.subcategories.map((sub) => ({ title: sub.name })) : [];

	// 		// setSubcategories(subcategoryList);
	// 		updateSubCategory(subcategoryList)
	// 		updateDefaultSubcategories(subcategoryList)
	// 		// console.log(subcategoryList)
	// 		setDescriptors([]); // Reset descriptors
	// 		setSelectedSubcategory(""); // Reset selected subcategory

	// 	}
	// }, [selectedCategory]);

	const optionsHandler = (selectedCategory, id) => {
		console.log('selectedCategory', selectedCategory)
		console.log('id', id)
		const keys = id.split('').map(Number)
		const stage1key = String(props.straitNum) + String(keys[1]) + '1'
		const stage2key = String(props.straitNum) +String(keys[1]) + '2'
		const stage3key = String(props.straitNum) +String(keys[1]) + '3'


		if (keys[2] == 1) {
			
			console.log('stage2key', stage2key)
			const selected = props.options.data.find((item) => item.category === selectedCategory.title);
			const subcategoryList = selected ? selected.subcategories.map((sub) => ({ title: sub.name })) : [];
	
			subCategory[stage2key] = subcategoryList
			updateSubCategory(subCategory)

			aromaStagesFormData[stage1key] = selectedCategory.title
			updateAromaStagesFormData(aromaStagesFormData)
		}
		if (keys[2] == 2) {
			

			console.log('stage1key', stage1key)
			console.log('stage3key', stage3key)
			console.log('aromaStagesFormData[stage1key]', aromaStagesFormData[stage1key])
			console.log('selectedSubcategory', selectedCategory.title)
			let selected = props.options.data
			.find((item) => item.category === aromaStagesFormData[stage1key])
			?.subcategories.find((sub) => sub.name === selectedCategory.title);
			console.log('selected', selected)
			selected = selected.descriptors.map((item) => ({title: item}));
			const descriptorList = selected ? selected : [];
			console.log('descriptorList', descriptorList)
			subCategory[stage3key] = descriptorList
			updateSubCategory(subCategory)
		}

	}


	const addAromaStagesComponent = () => {
		// console.log(stagesCount)
		stagesCount != 5 ? setStagesCount(stagesCount+=1):setStagesCount(stagesCount)
		renderAromaStages()
	}

	const removeAromaStagesComponent = () => {
		stagesCount != 1 ? setStagesCount(stagesCount-=1):setStagesCount(stagesCount)
		renderAromaStages()
		updateAromaStagesFormData(aromaStagesFormData)
	}

	const aromaStages = (key) => {
		key = parseInt((key).toString());
		const key1 = String(props.straitNum) + key + '1'
		const key2 = String(props.straitNum) + key + '2'
		const key3 = String(props.straitNum) + key + '3'

		return(
			<section className='form_aroma-stages'>
				<h4 className="form_stages-header">Аромат №{key}</h4>
				<SelectBox keyId={key1} 
					options={categoryList} boxName='Этап №1'
					optionsHandler={optionsHandler}
					handler={props.stagesHandler}
					boxId = 'AromaStage1'
					defaultValue={aromaStagesFormData[key1]}
					/>
				<SelectBox keyId={key2}
					options={subcategories}
					optionsHandler={optionsHandler}
					boxName='Этап №2' 
					handler={props.stagesHandler}
					boxId = 'AromaStage2'
					defaultValue={aromaStagesFormData[key2]}
					/>
				<SelectBox keyId={key3} 
					options={props.options} 
					optionsHandler={optionsHandler}
					boxName='Этап №3'
					boxId = 'AromaStage3'
					handler={props.stagesHandler}
					defaultValue={aromaStagesFormData[key3]}
					/>
			</section>
			)

	}

	const addAromaStages = (stagesCount) =>{
		for (let i = 0; i < stagesCount; i++) {
			stagesArray.push(aromaStages(i+1))
		}
	}

	function clearStageArraysIf() {

		if (prevStagesCount > stagesCount){
			props.clearFnc(prevStagesCount, aromaStagesFormData, true)
		}
	}


	return(
		<div className="form_aroma">
			{stages}
			<FormButton 
				buttonName={'Добавить еще оттенок аромата'}
				onClick={addAromaStagesComponent}
			/>
			<FormButton 
				buttonName={'Удалить последний оттенок аромата'}
				onClick={removeAromaStagesComponent}
			/>
		</div>
		)
}

export default AromaStages;