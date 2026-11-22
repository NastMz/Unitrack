export function AboutPanel() {
  return (
    <div className="panel-body about">
      <header className="page-hero">
        <p className="eyebrow">Acerca de</p>
        <h1>Unitrack</h1>
        <p>
          Las rutas universitarias de la Universidad de los Llanos en Villavicencio: dónde paran, a qué hora salen y qué
          novedades tienen.
        </p>
      </header>

      <section>
        <h2>Cómo leer los horarios</h2>
        <p>
          Cada ruta tiene horas de salida fijas: hacia la universidad desde su primer paradero y de regreso desde la sede
          Barcelona. La hora en los demás paraderos es una estimación calculada con la distancia por las calles y una
          velocidad media de 20 km/h, más medio minuto por parada. El servicio opera de lunes a sábado.
        </p>
      </section>

      <section>
        <h2>Origen del proyecto</h2>
        <p>
          Unitrack reúne tres proyectos estudiantiles de la Universidad de los Llanos: Unitrack
          (Sistemas Distribuidos), UniApp Unillanos y UniRutas (Software II). De ellos vienen los paraderos, los
          recorridos, los horarios y la idea de los avisos por ruta.
        </p>
        <p>
          Equipo original, según el historial de los repositorios: Kevin Martinez (NastMz), Joshep Mateo Granada
          Quinchia (JhMateo), RAGNAROK1307 y CamiloTejeiro12.
        </p>
      </section>

      <section>
        <h2>Datos</h2>
        <p>
          Mapa base: © OpenStreetMap contributors, disponible bajo la licencia ODbL. Los avisos son datos de demostración. Este
          es un proyecto académico independiente; no es un servicio oficial de la universidad.
        </p>
      </section>
    </div>
  );
}
