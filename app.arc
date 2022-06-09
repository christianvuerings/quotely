@app
quotely-66ce

@http
/*
  method any
  src server

@static

@tables
user
  pk *String

password
  pk *String # userId

quote
  pk *String  # userId
  sk **String # quoteId
