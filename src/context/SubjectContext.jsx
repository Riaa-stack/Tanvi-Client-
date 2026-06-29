import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from "react";

import { api } from "./AuthContext.jsx";

const SubjectContext = createContext(null);

export const SubjectProvider = ({ children }) => {

  const [subjects, setSubjects] = useState([]);
  const [activeSubject, setActiveSubject] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // Fetch Subjects
  // ==========================================

  const fetchSubjects = async () => {

    try {

      setLoading(true);

      const token = localStorage.getItem("edu_token");

      if (!token) {

        setSubjects([]);
        setActiveSubject(null);
        return;

      }

      const res = await api.get("/api/subjects");

      const subjectList = res.data.subjects || [];

      setSubjects(subjectList);

      const savedId = Number(
        localStorage.getItem("active_subject_id")
      );

      const found = subjectList.find(
        subject => subject.id === savedId
      );

      if (found) {

        setActiveSubject(found);

      }
      else if (subjectList.length > 0) {

        setActiveSubject(subjectList[0]);

        localStorage.setItem(
          "active_subject_id",
          subjectList[0].id
        );

      }
      else {

        setActiveSubject(null);

      }

    }
    catch (err) {

      console.error(
        "Failed to fetch subjects:",
        err
      );

      setSubjects([]);
      setActiveSubject(null);

    }
    finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    fetchSubjects();

  }, []);

  // ==========================================
  // Select Subject
  // ==========================================

  const selectSubject = (subject) => {

    setActiveSubject(subject);

    if (subject) {

      localStorage.setItem(
        "active_subject_id",
        subject.id
      );

    }
    else {

      localStorage.removeItem(
        "active_subject_id"
      );

    }

  };

  return (

    <SubjectContext.Provider
      value={{
        subjects,
        activeSubject,
        selectSubject,
        loading,
        refreshSubjects: fetchSubjects
      }}
    >

      {children}

    </SubjectContext.Provider>

  );

};

export const useSubject = () => useContext(SubjectContext);

export default SubjectContext;