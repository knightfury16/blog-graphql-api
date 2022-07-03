// Dummy Users
const users = [
  {
    id: '1',
    name: 'Dev_Mishra',
    email: 'Aanand.Nehru@example.net',
    age: 22
  },
  {
    id: '2',
    name: 'Agastya_Adiga',
    email: 'Chitramala21@example.net',
    age: 23
  },
  {
    id: '3',
    name: 'Agniprava48',
    email: 'Anasuya.Khatri22@example.com'
  }
];

const posts = [
  {
    id: '1',
    title: 'Learn Apple',
    body: 'Apple is good for dog',
    published: true,
    author: '1'
  },
  {
    id: '2',
    title: 'Ball',
    body: 'New type of ball game',
    published: false,
    author: '3'
  },
  {
    id: '3',
    title: 'Cat',
    body: 'Cat always land on feet',
    published: true,
    author: '1'
  }
];

const comments = [
  {
    id: '12',
    text: 'Wow!',
    author: '1',
    post: '1'
  },
  {
    id: '31',
    text: 'Nice Dog',
    author: '2',
    post: '3'
  },
  {
    id: '44',
    text: 'Does he bite',
    author: '2',
    post: '2'
  },
  {
    id: '11',
    text: 'Cute!',
    author: '1',
    post: '2'
  }
];

const db = {
  users,
  posts,
  comments
};

export default db;
