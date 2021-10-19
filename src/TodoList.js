import React, { useState, useEffect } from "react";
import pouchdb from "pouchdb";

function TodoApp() {
	var db = new pouchdb("bijaysharma");
	const [task, setTask] = useState("");
	const [tasklist, setTasklist] = useState([]);

	const handleChange = (e) => {
		setTask(e.target.value);
	};

    useEffect(  async () => {
        let temp = [];
		 await db.query(
			function (doc, emit) {
				emit(doc.type);
			},
			{ key: "task", include_docs: true }
		)
			
            .then( ( data ) => {
                console.log( data )
                data.rows.forEach( dd => {
                    console.log( dd.doc )
                    temp.push(dd.doc)
                })
			})
            .catch();
        
         	setTasklist(temp)/*  */
        
        console.log(temp)
     
	}, []);

	const deleteHandler = (id, e) => {
		setTasklist(tasklist.filter((t) => t._id !== id));
	};

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

	const deleteTask = (id, rev, e) => {
		const deleteId = id;
		deleteHandler(deleteId, e);

		db.remove(`${id}`, `${rev}`, function (err) {
			if (err) {
				return console.log(err);
			} else {
				console.log("Document deleted successfully");
			}
		});
		db.allDocs(function (err, docs) {
			if (err) {
				return console.log(err);
			} else {
				console.log("deleted", docs.rows);
			}
		});
	};

	function DestroyDatabase() {
		db.destroy(function (err, res) {
			if (err) {
				console.log(err);
			} else {
				console.log("Database is deleted...!");
			}
		});
	}

	var remoteDB = new pouchdb("http://localhost:5984/bijaysharma");
	db.sync(remoteDB);
	/* db.sync(remoteDB, {
        live: true,
        retry: true,
    }); */

	return (
		<div className="todo">
			<input type="text" onChange={handleChange} />
			<button onClick={addTask}>Add</button>
        {console.log(tasklist)}
			{tasklist !== []
				? tasklist.map((t) => (
						<ul>
							<li>
								<span>{t.name}</span>

								<button
									onClick={(e) => {
										deleteTask(t._id, t.rev);
									}}
								>
									Delete
								</button>
							</li>
						</ul>
				  ))
				: null}
			<button onClick={DestroyDatabase}>Destroy</button>
		</div>
	);
}

export default TodoApp;
