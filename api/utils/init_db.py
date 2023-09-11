from db import Base, get_session, get_engine


def init_db():
    engine = get_engine()
    Session = get_session()
    session = Session()
    Base.metadata.create_all(bind=engine)
    session.commit()
    session.close()


if __name__ == "__main__":
    init_db()
