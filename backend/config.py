class Config:
    SQLALCHEMY_DATABASE_URI = 'postgresql://postgres:password@host.docker.internal:5432/smartbudget'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = 'superstrongpassword'
