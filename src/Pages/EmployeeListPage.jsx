import React from 'react';
import Sidebar from '../components/Sidebar';
import EmployeeCard from '../components/EmployeeCard';
import styles from './EmployeeListPage.module.css';

export default function EmployeeListPage() {
  const employees = [
    {
      id: 'EMP123',
      name: 'Juliana Souza',
      img: 'https://randomuser.me/api/portraits/women/44.jpg',
      birthDate: '1990-04-10',
      since: 'junho 2018',
      procedures: ['Alongamento em fibra', 'Design de sobrancelhas'],
    },
    {
      id: 'EMP124',
      name: 'Ana Clara',
      img: 'https://randomuser.me/api/portraits/women/22.jpg',
      birthDate: '1993-09-21',
      since: 'março 2020',
      procedures: ['Cílios Egípcio', 'Pedicure'],
    },
    {
      id: 'EMP125',
      name: 'Camila Ribeiro',
      img: 'https://randomuser.me/api/portraits/women/3.jpg',
      birthDate: '1992-07-15',
      since: 'janeiro 2021',
      procedures: ['Manicure', 'Depilação'],
    },
    {
      id: 'EMP126',
      name: 'Larissa Lima',
      img: 'https://randomuser.me/api/portraits/women/4.jpg',
      birthDate: '1989-11-30',
      since: 'abril 2022',
      procedures: ['Progressiva', 'Coloração'],
    },
    {
      id: 'EMP127',
      name: 'Fernanda Alves',
      img: 'https://randomuser.me/api/portraits/women/5.jpg',
      birthDate: '1991-03-25',
      since: 'setembro 2019',
      procedures: ['Corte feminino', 'Escova modelada'],
    },
  ];

  return (
    <div className={styles.page}>
      <Sidebar />
      <div className={styles.content}>
        <div className={styles.topBar}></div>
        <h2 className={styles.title}>Funcionárias</h2>
        <div className={styles.grid}>
          {employees.map((employee) => (
            <EmployeeCard key={employee.id} employee={employee} />
          ))}
        </div>
      </div>
    </div>
  );
}
