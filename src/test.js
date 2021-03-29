let post = [
    { id: 1, title: "title 1" },
    { id: 2, title: "title 2" },
    { id: 3, title: "title 3" }
]

let postObj = {
    "id": 1,
    "content": "hello",
    "comment": []
}

let comment = [
    { id: 4, content: "comment 1", post_id: 1 },
    { id: 5, content: "comment 2", post_id: 2 },
    { id: 6, content: "comment 3", post_id: 2 }
]

var obj = {
    "name": "Root",
    "children": [{
        "name": "child1"
    },
    {
        "name": "child2"
    }
    ]
};

let objPost = JSON.stringify(post);
var newArray = [
    { "name": "child11" },
    { "name": "child12" }
];

var addElements = function (target, array) {
    postObj.comment.forEach(function (child) {
        if (child.name === target) {
            child['children'] = [...(child['children'] || []), ...newArray];
            return;
        }
    });
};

addElements('comment', newArray);


console.log(postObj);