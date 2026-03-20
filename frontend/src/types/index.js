// TypeScript型定義をJavaScriptで定義
// ユーザー型定義
export const UserType = {
  id: '',
  email: '',
  username: '',
  created_at: ''
};

// ペット型定義
export const PetType = {
  id: '',
  name: '',
  species: '',
  breed: '',
  birth_date: '',
  description: '',
  created_at: '',
  diary_count: 0
};

// 日記型定義
export const DiaryType = {
  id: '',
  pet_id: '',
  pet_name: '',
  title: '',
  content: '',
  image_url: '',
  created_at: ''
};

// TypeScript型定義として使用するための型エクスポート
// これによりTypeScriptでもJavaScriptでも動作する

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email  
 * @property {string} username
 * @property {string} created_at
 */

/**
 * @typedef {Object} Pet
 * @property {string} id
 * @property {string} name
 * @property {string} species
 * @property {string} breed
 * @property {string|null} birth_date
 * @property {string} description
 * @property {string} created_at
 * @property {number} [diary_count]
 */

/**
 * @typedef {Object} Diary
 * @property {string} id
 * @property {string} pet_id
 * @property {string} pet_name
 * @property {string} title
 * @property {string} content
 * @property {string|null} image_url
 * @property {string} created_at
 */

/**
 * @typedef {Object} PaginatedResponse
 * @property {Array} [diaries]
 * @property {Array} [pets]
 * @property {number} page
 * @property {number} pages
 * @property {number} per_page
 * @property {number} total
 */

export class User {}
export class Pet {}
export class Diary {}
export class PaginatedResponse {}