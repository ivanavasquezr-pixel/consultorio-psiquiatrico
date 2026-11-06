/**
 * Seeder de datos de prueba realistas para el Consultorio Psicológico.
 *
 * Inserta y actualiza (sin duplicar) información de las cinco entidades
 * principales, respetando las llaves foráneas:
 *
 *   consultorios -> psicologos -> citas <- pacientes
 *                                  |
 *                            historial_clinico
 *
 * Uso local:
 *   npm run sembrar:prueba
 *
 * En Render se puede ejecutar desde la pestaña "Shell" del servicio.
 * Las credenciales y el destino se toman de las variables de entorno
 * (DB_* o MYSQL*), igual que el resto de la API.
 *
 * Nota: el historial clínico se vincula con el paciente y el psicólogo
 * a través de la cita (id_cita), tal como está definido en el esquema.
 */

const {
  grupoConexiones,
  cerrarConexion,
  resumenConexion
} = require('../configuracion/conexion');

const CONSULTORIOS = [
  {
    nombre: 'CONS-101',
    ubicacion: 'Piso 1, Ala Norte',
    telefono: '+52 555 800 1101',
    estado: 'Disponible'
  },
  {
    nombre: 'CONS-202',
    ubicacion: 'Piso 2, Ala Sur',
    telefono: '+52 555 800 2202',
    estado: 'Ocupado'
  },
  {
    nombre: 'CONS-303',
    ubicacion: 'Piso 3, Área de Terapia Familiar',
    telefono: '+52 555 800 3303',
    estado: 'Disponible'
  }
];

const PSICOLOGOS = [
  {
    nombre: 'Ana',
    apellido: 'Martínez López',
    especialidad: 'Psicología Clínica',
    cedula_profesional: 'CED-PSI-1001',
    telefono: '+52 555 101 2001',
    correo: 'ana.martinez@consultorio-prueba.com',
    enfoque_terapeutico: 'Terapia cognitivo-conductual',
    consultorio: 'CONS-101'
  },
  {
    nombre: 'Carlos',
    apellido: 'Hernández Ruiz',
    especialidad: 'Terapia de Pareja',
    cedula_profesional: 'CED-PSI-1002',
    telefono: '+52 555 101 2002',
    correo: 'carlos.hernandez@consultorio-prueba.com',
    enfoque_terapeutico: 'Terapia sistémica familiar',
    consultorio: 'CONS-202'
  },
  {
    nombre: 'Laura',
    apellido: 'Gómez Sánchez',
    especialidad: 'Psicología Infantil',
    cedula_profesional: 'CED-PSI-1003',
    telefono: '+52 555 101 2003',
    correo: 'laura.gomez@consultorio-prueba.com',
    enfoque_terapeutico: 'Terapia de juego',
    consultorio: 'CONS-303'
  }
];

const PACIENTES = [
  {
    nombre: 'María Fernanda',
    apellido: 'López García',
    documento_identidad: 'LOPM900312MDFPRR08',
    fecha_nacimiento: '1990-03-12',
    sexo: 'Femenino',
    telefono: '+52 555 700 1001',
    correo: 'maria.lopez@correo-prueba.com',
    direccion: 'Av. Reforma 123, Col. Centro, CDMX',
    antecedentes: 'Sin antecedentes psicológicos relevantes.'
  },
  {
    nombre: 'Jorge Alberto',
    apellido: 'Ramírez Torres',
    documento_identidad: 'RATJ850726HDFMRR05',
    fecha_nacimiento: '1985-07-26',
    sexo: 'Masculino',
    telefono: '+52 555 700 2002',
    correo: 'jorge.ramirez@correo-prueba.com',
    direccion: 'Calle Hidalgo 45, Col. Roma, CDMX',
    antecedentes: 'Antecedente de ansiedad leve tratado en 2022.'
  },
  {
    nombre: 'Valeria',
    apellido: 'Sánchez Díaz',
    documento_identidad: 'SADV001120MDFNNL09',
    fecha_nacimiento: '2000-11-20',
    sexo: 'Femenino',
    telefono: '+52 555 700 3003',
    correo: 'valeria.sanchez@correo-prueba.com',
    direccion: 'Priv. Los Pinos 8, Col. Del Valle, CDMX',
    antecedentes: 'Sin antecedentes relevantes.'
  }
];

const CITAS = [
  {
    paciente: 'LOPM900312MDFPRR08',
    psicologo: 'CED-PSI-1001',
    consultorio: 'CONS-101',
    fecha_cita: '2026-10-15',
    hora_cita: '09:00:00',
    modalidad: 'Presencial',
    motivo: 'Primera consulta de evaluación',
    estado: 'Atendida'
  },
  {
    paciente: 'RATJ850726HDFMRR05',
    psicologo: 'CED-PSI-1002',
    consultorio: 'CONS-202',
    fecha_cita: '2026-10-20',
    hora_cita: '11:30:00',
    modalidad: 'Virtual',
    motivo: 'Sesión de terapia de pareja',
    estado: 'Atendida'
  },
  {
    paciente: 'SADV001120MDFNNL09',
    psicologo: 'CED-PSI-1003',
    consultorio: 'CONS-303',
    fecha_cita: '2026-10-27',
    hora_cita: '16:00:00',
    modalidad: 'Presencial',
    motivo: 'Evaluación psicológica infantil',
    estado: 'Atendida'
  }
];

const HISTORIALES = [
  {
    paciente: 'LOPM900312MDFPRR08',
    diagnostico: 'Episodio depresivo leve (F32.0)',
    tratamiento: 'Terapia cognitivo-conductual semanal durante 12 sesiones.',
    notas:
      'La paciente refiere mejoría en el sueño y disminución de la sintomatología ansiosa.'
  },
  {
    paciente: 'RATJ850726HDFMRR05',
    diagnostico: 'Dificultades de comunicación y conflicto de pareja (Z63.0)',
    tratamiento: 'Terapia de pareja quincenal con técnicas de comunicación asertiva.',
    notas:
      'Se observa disposición de ambos integrantes para continuar el proceso terapéutico.'
  },
  {
    paciente: 'SADV001120MDFNNL09',
    diagnostico: 'Trastorno de ansiedad por separación en la infancia (F93.0)',
    tratamiento: 'Terapia de juego semanal y orientación a cuidadores.',
    notas:
      'La paciente expresa sus emociones mediante el juego; se sugiere seguimiento familiar.'
  }
];

/**
 * Agrega la columna documento_identidad si la base de datos es anterior.
 * @param {object} conexion Conexión de MySQL.
 * @returns {Promise<void>}
 */
const asegurarDocumentoIdentidad = async (conexion) => {
  const [columna] = await conexion.query(
    `SELECT COUNT(*) AS total
     FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = 'pacientes'
       AND column_name = 'documento_identidad'`
  );

  if (Number(columna[0].total) === 0) {
    await conexion.query(
      'ALTER TABLE pacientes ADD COLUMN documento_identidad VARCHAR(30) NULL AFTER apellido'
    );
    console.log('✓ Columna pacientes.documento_identidad agregada.');
  }

  const [indice] = await conexion.query(
    `SELECT COUNT(*) AS total
     FROM information_schema.statistics
     WHERE table_schema = DATABASE()
       AND table_name = 'pacientes'
       AND index_name = 'uq_pacientes_documento'`
  );

  if (Number(indice[0].total) === 0) {
    await conexion.query(
      'ALTER TABLE pacientes ADD UNIQUE KEY uq_pacientes_documento (documento_identidad)'
    );
    console.log('✓ Índice único uq_pacientes_documento agregado.');
  }
};

const guardarConsultorio = async (conexion, datos) => {
  const [filas] = await conexion.execute(
    'SELECT id_consultorio FROM consultorios WHERE nombre = ? LIMIT 1',
    [datos.nombre]
  );

  if (filas.length > 0) {
    const id = filas[0].id_consultorio;
    await conexion.execute(
      `UPDATE consultorios
       SET ubicacion = ?, telefono = ?, estado = ?
       WHERE id_consultorio = ?`,
      [datos.ubicacion, datos.telefono, datos.estado, id]
    );
    return id;
  }

  const [resultado] = await conexion.execute(
    `INSERT INTO consultorios (nombre, ubicacion, telefono, estado)
     VALUES (?, ?, ?, ?)`,
    [datos.nombre, datos.ubicacion, datos.telefono, datos.estado]
  );

  return resultado.insertId;
};

const guardarPsicologo = async (conexion, datos, idConsultorio) => {
  await conexion.execute(
    `INSERT INTO psicologos
       (nombre, apellido, especialidad, cedula_profesional, telefono, correo,
        enfoque_terapeutico, id_consultorio)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       nombre = VALUES(nombre),
       apellido = VALUES(apellido),
       especialidad = VALUES(especialidad),
       telefono = VALUES(telefono),
       correo = VALUES(correo),
       enfoque_terapeutico = VALUES(enfoque_terapeutico),
       id_consultorio = VALUES(id_consultorio)`,
    [
      datos.nombre,
      datos.apellido,
      datos.especialidad,
      datos.cedula_profesional,
      datos.telefono,
      datos.correo,
      datos.enfoque_terapeutico,
      idConsultorio
    ]
  );

  const [filas] = await conexion.execute(
    'SELECT id_psicologo FROM psicologos WHERE cedula_profesional = ? LIMIT 1',
    [datos.cedula_profesional]
  );

  return filas[0].id_psicologo;
};

const guardarPaciente = async (conexion, datos) => {
  await conexion.execute(
    `INSERT INTO pacientes
       (nombre, apellido, documento_identidad, fecha_nacimiento, sexo, telefono,
        correo, direccion, antecedentes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       nombre = VALUES(nombre),
       apellido = VALUES(apellido),
       fecha_nacimiento = VALUES(fecha_nacimiento),
       sexo = VALUES(sexo),
       telefono = VALUES(telefono),
       correo = VALUES(correo),
       direccion = VALUES(direccion),
       antecedentes = VALUES(antecedentes)`,
    [
      datos.nombre,
      datos.apellido,
      datos.documento_identidad,
      datos.fecha_nacimiento,
      datos.sexo,
      datos.telefono,
      datos.correo,
      datos.direccion,
      datos.antecedentes
    ]
  );

  const [filas] = await conexion.execute(
    'SELECT id_paciente FROM pacientes WHERE documento_identidad = ? LIMIT 1',
    [datos.documento_identidad]
  );

  return filas[0].id_paciente;
};

const guardarCita = async (conexion, datos, ids) => {
  const [filas] = await conexion.execute(
    `SELECT id_cita
     FROM citas
     WHERE id_paciente = ? AND id_psicologo = ? AND fecha_cita = ? AND hora_cita = ?
     LIMIT 1`,
    [ids.idPaciente, ids.idPsicologo, datos.fecha_cita, datos.hora_cita]
  );

  if (filas.length > 0) {
    const id = filas[0].id_cita;
    await conexion.execute(
      `UPDATE citas
       SET id_consultorio = ?, modalidad = ?, motivo = ?, estado = ?
       WHERE id_cita = ?`,
      [
        ids.idConsultorio,
        datos.modalidad,
        datos.motivo,
        datos.estado,
        id
      ]
    );
    return id;
  }

  const [resultado] = await conexion.execute(
    `INSERT INTO citas
       (id_paciente, id_psicologo, id_consultorio, fecha_cita, hora_cita,
        modalidad, motivo, estado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      ids.idPaciente,
      ids.idPsicologo,
      ids.idConsultorio,
      datos.fecha_cita,
      datos.hora_cita,
      datos.modalidad,
      datos.motivo,
      datos.estado
    ]
  );

  return resultado.insertId;
};

const guardarHistorial = async (conexion, datos, idCita) => {
  await conexion.execute(
    `INSERT INTO historial_clinico (id_cita, diagnostico, tratamiento, notas)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       diagnostico = VALUES(diagnostico),
       tratamiento = VALUES(tratamiento),
       notas = VALUES(notas)`,
    [idCita, datos.diagnostico, datos.tratamiento, datos.notas]
  );

  const [filas] = await conexion.execute(
    'SELECT id_historial FROM historial_clinico WHERE id_cita = ? LIMIT 1',
    [idCita]
  );

  return filas[0].id_historial;
};

const sembrar = async () => {
  console.log(
    `Sembrando datos de prueba en ${resumenConexion.host}:${resumenConexion.puerto}/${resumenConexion.baseDatos} ` +
      `(origen: ${resumenConexion.origen}).\n`
  );

  const conexion = await grupoConexiones.getConnection();

  try {
    // La modificación del esquema no puede ir dentro de la transacción
    // porque MySQL ejecuta un COMMIT implícito en las sentencias DDL.
    await asegurarDocumentoIdentidad(conexion);

    await conexion.beginTransaction();

    const idsConsultorios = new Map();
    for (const consultorio of CONSULTORIOS) {
      const id = await guardarConsultorio(conexion, consultorio);
      idsConsultorios.set(consultorio.nombre, id);
    }

    const idsPsicologos = new Map();
    for (const psicologo of PSICOLOGOS) {
      const id = await guardarPsicologo(
        conexion,
        psicologo,
        idsConsultorios.get(psicologo.consultorio)
      );
      idsPsicologos.set(psicologo.cedula_profesional, id);
    }

    const idsPacientes = new Map();
    for (const paciente of PACIENTES) {
      const id = await guardarPaciente(conexion, paciente);
      idsPacientes.set(paciente.documento_identidad, id);
    }

    const idsCitas = new Map();
    for (const cita of CITAS) {
      const id = await guardarCita(conexion, cita, {
        idPaciente: idsPacientes.get(cita.paciente),
        idPsicologo: idsPsicologos.get(cita.psicologo),
        idConsultorio: idsConsultorios.get(cita.consultorio)
      });
      idsCitas.set(cita.paciente, id);
    }

    for (const historial of HISTORIALES) {
      await guardarHistorial(
        conexion,
        historial,
        idsCitas.get(historial.paciente)
      );
    }

    await conexion.commit();

    console.log('✓ Consultorios:');
    for (const [nombre, id] of idsConsultorios) {
      console.log(`   ${nombre} -> id_consultorio ${id}`);
    }

    console.log('✓ Psicólogos:');
    for (const [cedula, id] of idsPsicologos) {
      console.log(`   ${cedula} -> id_psicologo ${id}`);
    }

    console.log('✓ Pacientes:');
    for (const [documento, id] of idsPacientes) {
      console.log(`   ${documento} -> id_paciente ${id}`);
    }

    console.log('✓ Citas:');
    for (const cita of CITAS) {
      console.log(
        `   ${cita.paciente} + ${cita.psicologo} -> id_cita ${idsCitas.get(cita.paciente)} (${cita.fecha_cita} ${cita.hora_cita})`
      );
    }

    console.log('✓ Historial clínico:');
    for (const historial of HISTORIALES) {
      console.log(
        `   cita ${idsCitas.get(historial.paciente)} -> ${historial.diagnostico}`
      );
    }

    const [resumen] = await conexion.query(
      `SELECT
         (SELECT COUNT(*) FROM consultorios) AS consultorios,
         (SELECT COUNT(*) FROM psicologos) AS psicologos,
         (SELECT COUNT(*) FROM pacientes) AS pacientes,
         (SELECT COUNT(*) FROM citas) AS citas,
         (SELECT COUNT(*) FROM historial_clinico) AS historial`
    );

    console.log('\nTotales en la base de datos:');
    console.table(resumen[0]);

    const [relaciones] = await conexion.query(
      `SELECT
         c.id_cita,
         CONCAT(p.nombre, ' ', p.apellido) AS paciente,
         CONCAT(ps.nombre, ' ', ps.apellido) AS psicologo,
         co.nombre AS consultorio,
         c.fecha_cita,
         c.hora_cita,
         c.estado,
         h.diagnostico
       FROM citas c
       INNER JOIN pacientes p ON p.id_paciente = c.id_paciente
       INNER JOIN psicologos ps ON ps.id_psicologo = c.id_psicologo
       INNER JOIN consultorios co ON co.id_consultorio = c.id_consultorio
       LEFT JOIN historial_clinico h ON h.id_cita = c.id_cita
       WHERE p.documento_identidad IN (?, ?, ?)
       ORDER BY c.fecha_cita ASC`,
      PACIENTES.map((paciente) => paciente.documento_identidad)
    );

    console.log('\nVerificación de relaciones (cita -> paciente, psicólogo y consultorio):');
    console.table(relaciones);

    console.log(
      '\n✓ Datos de prueba sembrados correctamente. Consulta GET /api/consultorios, /api/psicologos, /api/pacientes, /api/citas y /api/historial.'
    );
  } catch (error) {
    await conexion.rollback().catch(() => {});
    throw error;
  } finally {
    conexion.release();
  }
};

sembrar()
  .catch((error) => {
    console.error(`\n✗ Error al sembrar los datos: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await cerrarConexion().catch(() => {});
  });
