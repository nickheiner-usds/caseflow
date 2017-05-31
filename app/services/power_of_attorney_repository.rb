class PowerOfAttorneyRepository
  include PowerOfAttorneyMapper

  # :nocov:
  def self.poa_query(poa)
    VACOLS::Case.includes(:representative).find(poa.vacols_id)
  end
  # :nocov:

  # returns either the data or false
  def self.load_vacols_data(poa)
    case_record = MetricsService.record("VACOLS POA: load_vacols_data #{poa.vacols_id}",
                                        service: :vacols,
                                        name: "PowerOfAttorneyRepository.load_vacols_data") do
      poa_query(poa)
    end

    set_vacols_values(poa: poa, case_record: case_record)

    true
  rescue ActiveRecord::RecordNotFound
    return false
  end

  def self.set_vacols_values(poa:, case_record:)
    rep_info = get_poa_from_vacols_poa(
      vacols_code: case_record.bfso,
      representative_record: case_record.representative
    )

    poa.assign_from_vacols(
      vacols_representative_type: rep_info[:representative_type],
      vacols_representative_name: rep_info[:representative_name]
    )
  end
end
