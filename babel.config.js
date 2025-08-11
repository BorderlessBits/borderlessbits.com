module.exports = {
  presets: [
    ['next/babel'],
    ['@babel/preset-typescript', { 
      isTSX: true,
      allExtensions: true,
      allowNamespaces: true 
    }],
    ['@babel/preset-react', { 
      runtime: 'automatic',
      importSource: 'react'
    }]
  ],
  plugins: [],
  env: {
    test: {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-typescript', { 
          isTSX: true,
          allExtensions: true,
          allowNamespaces: true 
        }],
        ['@babel/preset-react', { 
          runtime: 'automatic',
          importSource: 'react'
        }]
      ]
    }
  }
};