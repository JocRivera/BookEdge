import React from "react";
import ReactPaginate from "react-paginate";
import "./Pagination.css";

function Pagination({ pageCount, onPageChange }) {
  return (
    <ReactPaginate
      previousLabel={"Anterior"}
      nextLabel={"Siguiente"}
      breakLabel={"..."}
      pageCount={pageCount}
      marginPagesDisplayed={2}
      pageRangeDisplayed={3}
      onPageChange={onPageChange}
      containerClassName={"pagination"}
      activeClassName={"active"}
    />
  );
}

export default Pagination;
