import React, { useState, useEffect } from "react";
import pouchdb from "pouchdb";

function MapReduce() {
	const [tasklist, setTasklist] = useState([]);
	const [task, setTask] = useState("");
	var db = new pouchdb("mapreduce");

	const changeHandler = (e) => {
		setTask(e.target.value);
	};
	useEffect(async () => {
		db.query(
			function (doc, emit) {
				emit(doc.type);
			},
			{ key: "task", include_docs: true }
		)
			.then(function (result) {
				console.log(result.rows);
			})
			.catch(function (err) {
				console.log(err);
			});
	}, []);
	const addTask = (e) => {
		if (task !== "") {
			var doc = {
				_id: new Date().toISOString(),
				type: "task",
				name: task,
			};
			db.put(doc)
				.then((res) => {
					console.log("Document is inserted...!", doc);
					console.log(res.rev);
					doc.rev = res.rev;
				})
				.catch((err) => {
					console.log(err);
				});

			setTasklist([...tasklist, doc]);
			console.log(tasklist);
		}

		db.allDocs(function (err, docs) {
			if (err) {
				return console.log(err);
			} else {
				console.log("Added", docs.rows);
			}
		});
	};
	return (
		<div>
			<input type="text" onChange={changeHandler} />
			<button onClick={addTask}>Add</button>
		</div>
	);
}

export default MapReduce;
