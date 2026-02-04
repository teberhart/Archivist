export async function hash(value: string) {
  return `hashed:${value}`;
}

export async function compare(value: string, hashed: string) {
  return hashed === `hashed:${value}`;
}

const bcrypt = {
  hash,
  compare,
};

export default bcrypt;
